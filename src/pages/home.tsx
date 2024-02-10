import { createSignal, createEffect, } from 'solid-js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// class Floor {
//   constructor(){
//     this.
//   }
// }

// class Building { 
//   currFloor : number;
//   floors : Floor[];
//   defaultFloor : number;
//   constructor(floors, defaultFloor){
//     this.floors = floors;
//     this.defaultFloor = defaultFloor;
//     this.currFloor = defaultFloor;
//   }
// }

export default function Home() {
  const [currFloor, setCurrFloor] = createSignal(0);

  const toggleFloor = () => {
    setCurrFloor(1-currFloor());
  }

  let mapContainer: HTMLDivElement;
  createEffect(() => {

    // scene
    var scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 5;
    camera.rotation.x = -75;

    // renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(document.body.clientWidth, document.body.clientHeight);
    mapContainer.appendChild(renderer.domElement);

    // controls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null
    }
    controls.minDistance = 2.5;
    controls.maxDistance = 10;
    
    // axis guide
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    
    // map
    const loader = new GLTFLoader();
    loader.load('model/floor2.glb', function(glb) {
      glb.scene.scale.set(10,10,10);
      glb.scene.position.z = -10;
      glb.scene.position.x = 5;
      scene.add(glb.scene);
      console.log(glb.scene);
    }, undefined, function (error) {console.error(error);});

    // light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.add( directionalLight );

    // animate();
    var animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    };
    animate();

  }, []);
  return (
    <div class="h-full w-full">
      <div ref={mapContainer}>

      </div>
    </div>
  );
}
