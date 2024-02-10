import { createSignal, createEffect, } from 'solid-js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { Building } from './map/Building';
import { Floor } from './map/Floor';

export interface HomeProps {
  inheritSize: boolean;
}

export default function Home(props: HomeProps) {
  const [inBuilding, setInBuilding] = createSignal(true);
  const [currFloor, setCurrFloor] = createSignal(0);

  var building = new Building("McNeil", 0, [
    new Floor('model/floor1.glb'),
    new Floor('model/floor2.glb')
  ]);


  const toggleFloor = () => {
    setCurrFloor(1-currFloor());
    building.moveToFloor(currFloor());
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
    if (props.inheritSize) {
      renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
    } else {
      renderer.setSize(1000, 1000);
    }
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

    // ground
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x95ff7a, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.rotateX(Math.PI/2);
    scene.add(plane);
    
    // load building
    building.load(scene);

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
      <div>
        <button onClick={toggleFloor}>hello</button>
        <div class="h-full w-full" ref={mapContainer} />
      </div>
  );
}
