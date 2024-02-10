import { createSignal, createEffect, } from 'solid-js';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import fontSize from '../assets/helvetiker_regular.typeface.json';
import { CanvasTexture, SpriteMaterial, Sprite } from 'three';


import { Building } from './map/Building';
import { Floor } from './map/Floor';

export interface HomeProps {
  inheritSize: boolean;
}

export default function Home(props: HomeProps) {
  const [inBuilding, setInBuilding] = createSignal(true);
  const [currFloor, setCurrFloor] = createSignal(0);


  var building = new Building("McNeil", "MC", 0, ['model/floor1.glb', 'model/floor2.glb']);

  const toggleBuilding = () => {
    setInBuilding(!inBuilding());
  }

  const toggleFloor = () => {
    setCurrFloor(1-currFloor());
    building.showFloor(currFloor());
  }

  let mapContainer: HTMLDivElement;
  createEffect(() => {
    // scene
    var scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 5;
    camera.rotation.x = -90;

    // renderer
    var renderer = new THREE.WebGLRenderer();
    if (props.inheritSize) {
      renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
    } else {
      renderer.setSize(document.body.clientWidth, document.body.clientHeight);
    }
    mapContainer.appendChild(renderer.domElement);

    // controls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE//null
    }
    controls.maxDistance = 1.5;
    controls.minDistance = 0.5;
    camera.zoom = controls.maxDistance;
    
    // axis guide
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    // ground
    const planeGeo = new THREE.PlaneGeometry(1000, 1000);
    const planeMat = new THREE.MeshBasicMaterial( {color: 0x95ff7a} );
    const plane = new THREE.Mesh( planeGeo, planeMat );
    plane.rotateX(-Math.PI/2);
    scene.add(plane);
    
    // load building
    building.load(scene);

    // light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );

    // animate();
    var fps = 30;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;
    
    var animate = function () {
      requestAnimationFrame(animate);
      now = Date.now();
      delta = now - then;
  
      if (delta > interval) {
          // update time stuffs
  
          // Just `then = now` is not enough.
          // Lets say we set fps at 10 which means
          // each frame takes 100ms
          // Now frame executes in 16ms (60fps) so
          // the loop iterates 7 times (16*7 = 112ms) until
          // delta > interval and in this 7 iterations
          // frame was rendered only once which is equivalent to
          // 16.7fps. Therefore we subtract delta by interval
          // to keep the delay constant overtime and so 1sec = 10 frames
          then = now - (delta % interval);
  
          // ... Code for Drawing the Frame ...
          renderer.render(scene, camera);
          controls.update();
      }
    };
    animate();

  }, []);
  return (
      <div>
        <div class="h-full w-full" ref={mapContainer} />
        <div class="absolute top-0 left-0">
          <button onClick={toggleBuilding}>building</button>
          <button onClick={toggleFloor}>floor</button>
        </div>
      </div>
  );
}
