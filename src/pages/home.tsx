import { createSignal, createEffect, } from 'solid-js';
import * as THREE from 'three';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

export default function Home() {
  const [count, setCount] = createSignal(0);

  let mapContainer: HTMLDivElement;
  createEffect(() => {
    // === THREE.JS CODE START ===
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 5
    camera.rotation.x = -90;
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene.background = new THREE.Color( 0xff0000 );

    // document.body.appendChild( renderer.domElement );
    // use ref as a mount point of the Three.js scene instead of the document.body

    var controls = new MapControls(camera, mapContainer);

    // cube
    mapContainer.appendChild(renderer.domElement);
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    var animate = function () {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      controls.update();
    };
    animate();

  }, []);
  return (

    <section class="bg-gray-100 text-gray-700 p-8">
      <h1 class="text-2xl font-bold">Home</h1>
      <p class="mt-4">This is the home page.</p>

      <div class="flex items-center space-x-2">
        <button
          class="border rounded-lg px-2 border-gray-900"
          onClick={() => setCount(count() - 1)}
        >
          -
        </button>

        <output class="p-10px">Count: {count()}</output>

        <button
          class="border rounded-lg px-2 border-gray-900"
          onClick={() => setCount(count() + 1)}
        >
          +
        </button>

        <div ref={mapContainer}></div>
      </div>
    </section>

  );
}
