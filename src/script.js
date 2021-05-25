import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

let camera, scene, renderer, sizes, controls;

init();
render();

function init() {
  const canvas = document.querySelector("canvas.webgl");
  const productContainer = document.querySelector(".product-container");

  sizes = {
    width: 300,
    height: 300,
  };

  camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.25,
    20
  );
  camera.position.set(0, 0, 5);

  scene = new THREE.Scene();

  new RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .setPath("textures/equirectangular/")
    .load("studio_small_03_1k.hdr", function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;

      scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();

      render();

      // model
      const loaderAffco = new GLTFLoader().setPath("/gltf/affco/");
      loaderAffco.load("affco.gltf", function (gltf) {
        gltf.scene.scale.set(0.1, 0.1, 0.1);
        gltf.scene.rotation.y = 0.5;
        gltf.scene.traverse(function (child) {});

        scene.add(gltf.scene);

        render();
      });
    });

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(sizes.width, sizes.height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  controls = new OrbitControls(camera, canvas);
  controls.addEventListener("change", render); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.update();

  requestAnimationFrame(animate);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  sizes.width = productContainer.clientWidth;
  sizes.height = productContainer.clientHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);

  render();
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

//

function render() {
  renderer.render(scene, camera);
}
