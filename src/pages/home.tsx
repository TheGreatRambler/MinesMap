import { createSignal, createEffect, } from 'solid-js';
import * as THREE from 'three';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Home() {
  // const [count, setCount] = createSignal(0);

  let mapContainer: HTMLDivElement;
  createEffect(() => {

    var scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 5
    camera.rotation.x = -75;

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
    mapContainer.appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null
    }
    controls.minDistance = 2.5;
    controls.maxDistance = 10;

    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    // map
    const loader = new GLTFLoader();
    loader.load('model/example.gltf', function(gltf) {
      gltf.scene.scale.set(10,10,10);
      gltf.scene.position.z = -10;
      gltf.scene.position.x = 5;
      scene.add(gltf.scene);
    }, undefined, function (error) {console.error(error);});

    // light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.add( directionalLight );
    
    var animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    };
    animate();

  }, []);
  return (

      <div class="h-full w-full" ref={mapContainer}></div>

  );
}
