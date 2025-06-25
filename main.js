import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import Stats from "stats.js";

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const gui = new GUI();

const params = {
  rotationSpeed: 0.05,
  cameraY: 5,
  cameraZ: 20,
  fov: 75,
  skyColor: 0xffffff,
  groundColor: 0x444444,
  intensity: 3,
};

gui
  .add(params, "rotationSpeed", 0, 0.05)
  .name("旋转速度")
  .onChange((val) => (model.rotation.y = val));
gui
  .add(params, "cameraY", -10, 100)
  .name("摄像机Y")
  .onChange((val) => (camera.position.y = val));
gui
  .add(params, "cameraZ", -10, 140)
  .name("摄像机Z")
  .onChange((val) => (camera.position.z = val));
gui
  .add(params, "fov", 10, 120)
  .name("摄像机FOV")
  .onChange((val) => {
    camera.fov = val;
    camera.updateProjectionMatrix();
  });
gui
  .addColor(params, "skyColor")
  .name("天空颜色")
  .onChange((val) => {
    light.color.set(val);
  });
gui
  .addColor(params, "groundColor")
  .name("地面颜色")
  .onChange((val) => {
    light.groundColor.set(val);
  });
gui
  .add(params, "intensity", 0, 10)
  .name("灯光强度")
  .onChange((val) => {
    light.intensity = val;
  });
// this scene holds our 3D objects
// base object for three.js
const scene = new THREE.Scene();
//PerspectiveCamera can holds four parameters
// They are, FOV, ratio aspect, near, far
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const canvas = document.querySelector("#c");
// WebGLRenderer is responsible for render our scene
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

// size of render target
renderer.setSize(window.innerWidth, window.innerHeight);

// //Output our render to our HTML
// document.body.appendChild(renderer.domElement);

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // compute a unit vector that points in the direction the camera is now
  // from the center of the box
  const direction = new THREE.Vector3()
    .subVectors(camera.position, boxCenter)
    .normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

let model;

// using GLTFLoader to add customized model
const loader = new GLTFLoader();
loader.load("model/test_2.glb", (gltf) => {
  model = gltf.scene;
  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const boxSize = box.getSize(new THREE.Vector3()).length();
  const boxCenter = box.getCenter(new THREE.Vector3());

  // set the camera to frame the box
  frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
  // update the Trackball controls to handle the new size
  controls.maxDistance = boxSize * 10;
  controls.target.copy(boxCenter);
  controls.update();
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

// add light
// 3 means intensity
//
const light = new THREE.HemisphereLight("0xffffff", 0x444444, 3);
light.position.set(0, 20, 0);
scene.add(light);

// set our camera right outside the model
camera.position.z = 140;
camera.position.y = 30;

function animate() {
  requestAnimationFrame(animate);
  // add rotation animation to our model
  stats.begin(); // 开始统计帧率
  // if (model) {
  //   model.rotation.y += 0.001;
  // }
  // to tell renderer to render the scene
  renderer.render(scene, camera);
  stats.end(); // 结束统计帧率
}

animate();
