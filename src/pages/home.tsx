import { createSignal, createEffect, } from 'solid-js';
import * as THREE from 'three';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

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
    renderer.setSize(window.innerWidth, window.innerHeight);
    mapContainer.appendChild(renderer.domElement);

    var controls = new MapControls(camera, renderer.domElement);
    controls.enableRotation = false;
    controls.zoomToCursor = true;

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

    <section class="p-0">
      <div ref={mapContainer}></div>
    </section>

  );
}
