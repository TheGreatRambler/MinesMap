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
    scene.background = new THREE.Color( 0xff0000 );

    // camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 5
    camera.rotation.x = -75;

    // renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(1000, 1000);
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

    // cap fps
    let clock = new THREE.Clock();
    let delta = 0;
    let interval = 1 / 30; // 30 fps
    
    // // axis guide
    // const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );

    // // map
    // const loader = new GLTFLoader();
    // loader.load('model/example.gltf', function(gltf) {
    //   gltf.scene.scale.set(10,10,10);
    //   gltf.scene.position.z = -10;
    //   gltf.scene.position.x = 5;
    //   scene.add(gltf.scene);
    // }, undefined, function (error) {console.error(error);});
    // console.log("hello");
    // // light
    // const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // scene.add( directionalLight );
    
    // var animate = function () {
    //   delta += clock.getDelta();
    //   if (delta  > interval) {
    //     requestAnimationFrame(animate);
    //     renderer.render(scene, camera);
    //     controls.update();
    //     delta = delta % interval;
    //   }
    // };
    // animate();

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
