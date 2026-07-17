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
const spinSpeed = document.querySelector("#spin-speed");
const defaultModelUrl = new URL("../models/DAB-BLOCK-01.3mf", import.meta.url).href;
const minimumSpinSpeed = 0.1;
const maximumSpinSpeed = 100;
const mediumSpinSpeed = Math.sqrt(minimumSpinSpeed * maximumSpinSpeed);
const blockColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--block-color")
  .trim() || "#000000";

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
  controls.touches.ONE = THREE.TOUCH.PAN;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  controls.minDistance = 2.5;
  controls.maxDistance = 8;
  controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = mediumSpinSpeed;

  canvas.addEventListener("touchmove", (event) => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.85);
  fillLight.position.set(-4, 1.5, 3);
  scene.add(fillLight);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcfcf, 1.25));

  const bodyColor = new THREE.Color(bodyInput?.value || blockColor);
  const accentColor = new THREE.Color(accentInput?.value || "#ffffff");
  const accentDisplayColor = new THREE.Vector3();

  function updateAccentDisplayColor(hexColor) {
    const value = Number.parseInt(hexColor.slice(1), 16);
    accentDisplayColor.set(
      ((value >> 16) & 255) / 255,
      ((value >> 8) & 255) / 255,
      (value & 255) / 255
    );
  }

  updateAccentDisplayColor(accentInput?.value || "#ffffff");

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.68,
    metalness: 0.02
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.dabAccentLinear = { value: accentColor };
    shader.uniforms.dabAccentDisplay = { value: accentDisplayColor };
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
        uniform vec3 dabAccentLinear;
        uniform vec3 dabAccentDisplay;
        void main() {
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `
        float dabIsAccent = 1.0 - step(0.001, distance(diffuseColor.rgb, dabAccentLinear));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, dabAccentDisplay, dabIsAccent);
        float dabPureWhite = step(0.999, min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b)));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), dabPureWhite);
        #include <dithering_fragment>
      `
    );
  };
  material.customProgramCacheKey = () => "dab-pure-white-v1";

  let model = null;
  let accentMask = null;
  let triangleCount = 0;
  let loadSequence = 0;

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
    const targetSize = stage.clientWidth < 620 ? 1.75 : 2.55;
    mesh.scale.setScalar(targetSize / maxAxis);
    mesh.rotation.set(THREE.MathUtils.degToRad(-62), 0, THREE.MathUtils.degToRad(-22));
    mesh.position.y = 0.55;

    controls.target.set(0, 0, 0);
    controls.update();
  }

  async function loadModel(url) {
    const sequence = ++loadSequence;
    if (status) {
      status.hidden = false;
      status.textContent = "Loading model";
    }

    try {
      const response = await fetch(url);
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

      const nextTriangleCount = geometry.getAttribute("position").count / 3;
      const paintedTriangles = readAccentMask(buffer);
      const nextAccentMask = paintedTriangles?.length === nextTriangleCount
        ? paintedTriangles
        : new Uint8Array(nextTriangleCount);
      geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(nextTriangleCount * 9), 3));

      if (sequence !== loadSequence) {
        geometry.dispose();
        return;
      }

      if (model) {
        scene.remove(model);
        model.geometry.dispose();
      }

      model = new THREE.Mesh(geometry, material);
      triangleCount = nextTriangleCount;
      accentMask = nextAccentMask;
      fitModel(model);
      scene.add(model);
      updateVertexColors();
      if (status) status.hidden = true;
    } catch (error) {
      if (sequence !== loadSequence) return;
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
    updateAccentDisplayColor(accentInput.value);
    if (accentValue) accentValue.textContent = accentInput.value.toUpperCase();
    updateVertexColors();
  });

  zoomOut?.addEventListener("click", () => zoom(1.18));
  zoomIn?.addEventListener("click", () => zoom(0.84));

  spinSpeed?.addEventListener("input", () => {
    controls.autoRotate = true;
    const sliderProgress = Number(spinSpeed.value) / 100;
    controls.autoRotateSpeed = minimumSpinSpeed * ((maximumSpinSpeed / minimumSpinSpeed) ** sliderProgress);
  });

  window.addEventListener("dab:model-change", (event) => {
    if (event.detail?.modelUrl) loadModel(event.detail.modelUrl);
  });

  resize();
  window.addEventListener("resize", resize);
  const selectedModelUrl = document.querySelector('input[name="hold-type"]:checked')?.dataset.modelUrl;
  loadModel(selectedModelUrl || defaultModelUrl);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
