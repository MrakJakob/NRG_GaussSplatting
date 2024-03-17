import * as THREE from "three";
import parseSplatFile from "./parseSplat";
import * as dat from "dat.gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { useRenderer, useCamera, useScene, initEngine } from "./render";

let renderer, scene, camera;
let material;
let SPLAT_SCALE = 15.0;

// GUI
var gui_obj = {
  splat_scale: SPLAT_SCALE,
};
const gui = new dat.GUI();
const scaleController = gui.add(gui_obj, "splat_scale", 1.0, 40.0);

// Load splat data from file
const filename = "/train.splat";

const splatData = await parseSplatFile(filename);

function transformPoint(splat) {
  const viewMatrix = camera.matrixWorldInverse;
  const projectionMatrix = camera.projectionMatrix;

  const jointMatrix = new THREE.Matrix4().multiplyMatrices(
    projectionMatrix,
    viewMatrix
  );
  const point = new THREE.Vector3(
    splat.position[0],
    splat.position[1],
    splat.position[2]
  );

  const modelMatrix = new THREE.Matrix4();
  modelMatrix.setPosition(new THREE.Vector3(0, 0, -6));
  // modelMatrix.setPosition(new THREE.Vector3(0.8, 1.7, -0.53));
  // modelMatrix.setPosition(new THREE.Vector3(0, 0, 0));

  let angle = (2 * Math.PI) / 3; 
  angle = Math.PI;
  const rotateX = new THREE.Matrix4(
    1,
    0,
    0,
    0,
    0,
    Math.cos(angle),
    -Math.sin(angle),
    0,
    0,
    Math.sin(angle),
    Math.cos(angle),
    0,
    0,
    0,
    0,
    1
  );
  modelMatrix.multiply(rotateX);

  angle = Math.PI / 8; 
  const rotatey = new THREE.Matrix4(
    Math.cos(angle),
    0,
    Math.sin(angle),
    0,
    0,
    1,
    0,
    0,
    -Math.sin(angle),
    0,
    Math.cos(angle),
    0,
    0,
    0,
    0,
    1
  );
  // modelMatrix.multiply(rotatey);

  // Apply joint transformation matrix
  jointMatrix.multiplyMatrices(modelMatrix, scene.matrixWorld); // Update joint matrix
  point.applyMatrix4(jointMatrix);

  const transformedPoint = point.clone();

  return transformedPoint;
}

let start_time;
let end_time;

const startApp = async () => {
  await initEngine();
  renderer = useRenderer();
  scene = useScene();
  camera = useCamera();

  start_time = performance.now();
  // PREPROCESSING SPLATS COLORS
  for (const splat of splatData) {
    splat.color.r *= splat.color.a;
    splat.color.g *= splat.color.a;
    splat.color.b *= splat.color.a;
  }
  // SORTING SPLATS
  splatData.sort((a, b) => {
    let aPoint = new THREE.Vector3(a.x, a.y, a.z);
    let bPoint = new THREE.Vector3(b.x, b.y, b.z);

    aPoint = transformPoint(a);
    bPoint = transformPoint(b);

    return aPoint.z - bPoint.z;
  });
  console.log("received splatData: ", splatData);
  console.log("splatData length: ", splatData.length);

  const projectionMatrix = camera.projectionMatrix;
  const viewMatrix = camera.matrixWorldInverse;


  const inverse_view_projection_matrix = new THREE.Matrix4();
  inverse_view_projection_matrix.multiplyMatrices(projectionMatrix, viewMatrix);
  inverse_view_projection_matrix.invert();
  let count = 0;

  const positions = [];
  const colors = [];
  const scales = [];
  splatData.forEach((splat) => {
    const point = transformPoint(splat);
    positions.push(point.x, point.y, point.z);
    colors.push(
      splat.color[0] / 255,
      splat.color[1] / 255,
      splat.color[2] / 255,
      splat.color[3] / 255
    );
    scales.push(splat.scales[0], splat.scales[1], splat.scales[2]);
  });

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  pointGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 4)
  );
  pointGeometry.setAttribute(
    "scale",
    new THREE.Float32BufferAttribute(scales, 3)
  );

  material = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      scale: { value: SPLAT_SCALE },
    },
    transparent: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
  });

  const pointCloud = new THREE.Points(pointGeometry, material);
  scene.add(pointCloud);

  console.log("drawing finished");
  end_time = performance.now();

  let timeInSec = (end_time - start_time) / 1000;
  console.log(filename);
  console.log("Time to draw: ", timeInSec);
  console.log("Number of splats: ", count);

  // Animate
  animate();
};

// LISTENERS
scaleController.onChange((value) => {
  SPLAT_SCALE = value;
  material.uniforms.scale.value = SPLAT_SCALE;
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

startApp();
