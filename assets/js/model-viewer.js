import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeMFLoader } from "three/addons/loaders/3MFLoader.js";
import { strFromU8, unzipSync } from "three/addons/libs/fflate.module.js";

const stage = document.querySelector("#model-stage");
const canvas = document.querySelector("#model-canvas");
const status = document.querySelector("#model-status");
const bodyInput = document.querySelector("#body-color");
const accentInput = document.querySelector("#accent-color");
const bodyValue = document.querySelector("#body-color-value");
const accentValue = document.querySelector("#accent-color-value");
const zoomOut = document.querySelector("#zoom-out");
const zoomIn = document.querySelector("#zoom-in");
const spinToggle = document.querySelector("#spin-toggle");
const modelUrl = new URL("../models/DAB-BLOCK-01.3mf", import.meta.url);
const blockColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--block-color")
  .trim() || "#dc9292";

if (stage && canvas) {
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (error) {
    if (status) status.textContent = "3D preview unavailable";
    throw error;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 1000);
  camera.position.set(0, 0.5, 5.8);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.5;
  controls.maxDistance = 8;
  controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = 0.45;

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.85);
  fillLight.position.set(-4, 1.5, 3);
  scene.add(fillLight);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcfcf, 1.25));

  const bodyColor = new THREE.Color(bodyInput?.value || blockColor);
  const accentColor = new THREE.Color(accentInput?.value || "#443d5e");
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.68,
    metalness: 0.02
  });

  let model = null;
  let accentMask = null;
  let triangleCount = 0;

  function readAccentMask(buffer) {
    const files = unzipSync(new Uint8Array(buffer));
    const modelPath = Object.keys(files).find((name) => name.toLowerCase().endsWith(".model"));
    if (!modelPath) return null;

    const document = new DOMParser().parseFromString(strFromU8(files[modelPath]), "application/xml");
    const triangles = document.getElementsByTagName("triangle");
    const mask = new Uint8Array(triangles.length);

    for (let index = 0; index < triangles.length; index += 1) {
      if (triangles[index].hasAttribute("paint_color")) mask[index] = 1;
    }

    return mask;
  }

  function updateVertexColors() {
    if (!model || !accentMask) return;
    const colors = model.geometry.getAttribute("color");

    for (let triangle = 0; triangle < triangleCount; triangle += 1) {
      const color = accentMask[triangle] ? accentColor : bodyColor;
      for (let vertex = 0; vertex < 3; vertex += 1) {
        colors.setXYZ((triangle * 3) + vertex, color.r, color.g, color.b);
      }
    }

    colors.needsUpdate = true;
  }

  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function fitModel(mesh) {
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    mesh.geometry.translate(-center.x, -center.y, -center.z);
    const maxAxis = Math.max(size.x, size.y, size.z);
    const targetSize = stage.clientWidth < 620 ? 1.95 : 2.82;
    mesh.scale.setScalar(targetSize / maxAxis);
    mesh.rotation.set(THREE.MathUtils.degToRad(-62), 0, THREE.MathUtils.degToRad(-22));

    controls.target.set(0, 0, 0);
    controls.update();
  }

  async function loadModel() {
    try {
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
      const buffer = await response.arrayBuffer();
      const loadedModel = new ThreeMFLoader().parse(buffer);
      loadedModel.updateMatrixWorld(true);

      const sourceMesh = loadedModel.getObjectByProperty("isMesh", true);
      if (!sourceMesh) throw new Error("3MF contains no mesh");

      let geometry = sourceMesh.geometry.clone();
      geometry.applyMatrix4(sourceMesh.matrixWorld);
      geometry = geometry.toNonIndexed();
      geometry.computeVertexNormals();

      triangleCount = geometry.getAttribute("position").count / 3;
      const paintedTriangles = readAccentMask(buffer);
      accentMask = paintedTriangles?.length === triangleCount
        ? paintedTriangles
        : new Uint8Array(triangleCount);
      geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(triangleCount * 9), 3));

      model = new THREE.Mesh(geometry, material);
      fitModel(model);
      scene.add(model);
      updateVertexColors();
      if (status) status.hidden = true;
    } catch (error) {
      if (status) status.textContent = "Model unavailable";
      console.error(error);
    }
  }

  function zoom(factor) {
    const offset = camera.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(
      offset.length() * factor,
      controls.minDistance,
      controls.maxDistance
    );
    camera.position.copy(controls.target).add(offset.setLength(distance));
    controls.update();
  }

  bodyInput?.addEventListener("input", () => {
    bodyColor.set(bodyInput.value);
    if (bodyValue) bodyValue.textContent = bodyInput.value.toUpperCase();
    updateVertexColors();
  });

  accentInput?.addEventListener("input", () => {
    accentColor.set(accentInput.value);
    if (accentValue) accentValue.textContent = accentInput.value.toUpperCase();
    updateVertexColors();
  });

  zoomOut?.addEventListener("click", () => zoom(1.18));
  zoomIn?.addEventListener("click", () => zoom(0.84));

  spinToggle?.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    spinToggle.setAttribute("aria-pressed", String(controls.autoRotate));
    spinToggle.textContent = controls.autoRotate ? "Spin on" : "Spin off";
  });

  if (spinToggle) {
    spinToggle.setAttribute("aria-pressed", String(controls.autoRotate));
    spinToggle.textContent = controls.autoRotate ? "Spin on" : "Spin off";
  }

  resize();
  window.addEventListener("resize", resize);
  loadModel();

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
