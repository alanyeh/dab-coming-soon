import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

const stage = document.querySelector("#model-stage");
const canvas = document.querySelector("#model-canvas");
const status = document.querySelector("#model-status");
const blockColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--block-color")
  .trim() || "#6d675a";
const blockLabelColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--block-label-color")
  .trim() || "#ffffff";

if (stage && canvas) {
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
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
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.85);
  fillLight.position.set(-4, 1.5, 3);
  scene.add(fillLight);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcfcf, 1.25));

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(blockColor),
    roughness: 0.68,
    metalness: 0.02
  });

  let model = null;

  function createLabel(text) {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 512;
    textureCanvas.height = 160;

    const context = textureCanvas.getContext("2d");
    context.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
    context.fillStyle = blockLabelColor;
    context.font = "700 87px Arial, Helvetica, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, textureCanvas.width / 2, textureCanvas.height / 2);

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      side: THREE.DoubleSide
    });

    return new THREE.Mesh(new THREE.PlaneGeometry(30, 9.375), material);
  }

  function addTopLabels(mesh, size) {
    const topZ = size.z / 2 + 0.2;
    const labels = [
      { text: "20 mm", position: [19, 18, topZ], rotation: -0.03 },
      { text: "25 mm", position: [-11, -18, topZ], rotation: -0.02 }
    ];

    labels.forEach(({ text, position, rotation }) => {
      const label = createLabel(text);
      label.position.set(...position);
      label.rotation.z = rotation;
      mesh.add(label);
    });
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
    addTopLabels(mesh, size);

    controls.target.set(0, 0, 0);
    controls.update();
  }

  new STLLoader().load(
    "assets/models/DAB-BLOCK-01.stl",
    (geometry) => {
      model = new THREE.Mesh(geometry, material);
      fitModel(model);
      scene.add(model);
      if (status) status.hidden = true;
    },
    undefined,
    () => {
      if (status) status.textContent = "Model unavailable";
    }
  );

  resize();
  window.addEventListener("resize", resize);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
