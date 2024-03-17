import * as THREE from "three";

let scene,
  camera,
  renderer,
  renderWidth,
  renderHeight,
  renderAspectRatio;

export const initEngine = async () => {
  scene = new THREE.Scene(
  );

  renderWidth = window.innerWidth;
  renderHeight = window.innerHeight;

  renderAspectRatio = renderWidth / renderHeight;

  camera = new THREE.PerspectiveCamera(75, renderAspectRatio, 0.1, 1000);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setSize(renderWidth, renderHeight);
  renderer.setPixelRatio(window.devicePixelRatio * 1.5);
  
  document.body.appendChild(renderer.domElement);

  renderer.setClearColor(0xffffff, 1);

  window.addEventListener(
    "resize",
    () => {
      renderWidth = window.innerWidth;
      renderHeight = window.innerHeight;
      renderAspectRatio = renderWidth / renderHeight;

      renderer.setPixelRatio(window.devicePixelRatio * 1.5);

      camera.aspect = renderAspectRatio;
      camera.updateProjectionMatrix();

      renderer.setSize(renderWidth, renderHeight);
      
    },
    false
  );
};

export const useRenderer = () => renderer;

export const useRenderSize = () => ({
  width: renderWidth,
  height: renderHeight,
});

export const useScene = () => scene;

export const useCamera = () => camera;
