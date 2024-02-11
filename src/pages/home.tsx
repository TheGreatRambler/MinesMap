import { createSignal, createEffect } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Building } from "./map/Building";

import upArrow from "../assets/arrow_upward.svg";
import downArrow from "../assets/arrow_down.svg";

export interface HomeProps {
  inheritSize: boolean;
}

export default function Home(props: HomeProps) {
  const [inBuilding, setInBuilding] = createSignal(false);

  // animation stuff
  var minCameraY = 5;
  var maxCameraY = 8;
  var targetCameraX = -0.17;
  var targetCameraY = null;
  var targetCameraZ = 0.17;
  var inAnimation = false;
  const ANIMATION_SPEED = 0.15;

  var building = new Building("McNeil", "MC", 1, [
    "/model/floor1.glb",
    "/model/floor2.glb",
  ]);
  const [currFloor, setCurrFloor] = createSignal(building.currFloor);

  const toggleBuilding = () => {
    if (inBuilding()) {
      // building.leave();
      setInBuilding(false);
      minCameraY = 5;
      maxCameraY = 8;
      targetCameraY = 8;
    } else {
      building.enter();
      setInBuilding(true);
      minCameraY = 0.3;
      maxCameraY = 1.1;
      targetCameraY = 1.1;
    }
    inAnimation = true;
  };

  let setup = false;

  let mapContainer: HTMLDivElement;
  createEffect(() => {
    // scene
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // camera
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 5;
    camera.rotation.x = -90;

    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    if (!setup) {
      window.addEventListener("click", onDocumentMouseClick, false);

      function onDocumentMouseClick(event) {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera); // assuming you have a camera object

        let intersects = raycaster.intersectObjects(scene.children, true); // assuming you have a scene object

        for (let i = 0; i < intersects.length; i++) {
          if (intersects[i].object instanceof THREE.Sprite) {
            console.log(
              "Sprite clicked!" + JSON.stringify(intersects[i].object.room.name)
            );
            // Here you can add what should happen on click
          }
        }
      }
      setup = true;
    }

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
      RIGHT: null
    };
    controls.enableRotation = false;

    // axis guide
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // ground
    const planeGeo = new THREE.PlaneGeometry(1000, 1000);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0x95ff7a });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotateX(-Math.PI / 2);
    scene.add(plane);

    // load building
    building.load(scene);
    setCurrFloor(building.currFloor);

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);

    // animate();
    var fps = 30;
    var now;
    var then = Date.now();
    var interval = 1000 / fps;
    var delta;

    var animate = function () {
      requestAnimationFrame(animate);
      now = Date.now();
      delta = now - then;

      if (delta > interval) {

        // animation stuff
        if (inAnimation){
          camera.position.y += (targetCameraY-camera.position.y)*ANIMATION_SPEED;
          camera.position.x += (targetCameraX-camera.position.x)*ANIMATION_SPEED;
          camera.position.z += (targetCameraZ-camera.position.z)*ANIMATION_SPEED;
          if (Math.abs(camera.position.y-targetCameraY) < 0.01) inAnimation = false;
        } else {
          controls.minDistance = minCameraY;
          controls.maxDistance = maxCameraY;
        }
        camera.rotation.set(-Math.PI/2, 0, 0) // <-- bugs happen without this :(
        console.log(camera.rotation);
        
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
        // console.log(camera.position);
        renderer.render(scene, camera);
      }
    };
    animate();
  }, []);
  return (
    <div>
      <div class="h-full w-full" ref={mapContainer} />
      <div class="absolute top-0 left-0">
        <div class="bg-gray-500 rounded-3xl p-6 m-4 w-96 flex flex-row transition-all ease-in-out duration-500">
          <div class="w-full col-span-1">
            <button 
            onClick={toggleBuilding} class={`w-full rounded-2xl w-8 h-8 mb-4 p-8 flex justify-center items-center transition-all ease-in-out duration-500 content-box ${inBuilding() ? "text-black bg-gray-400" : "bg-gray-300" }`}>
              <p 
            class="text-xl font-open-sans font-bold">McNeil Hall</p>
            </button>
            <button 
            onClick={toggleBuilding} class="bg-gray-300 w-full rounded-2xl w-8 h-8 mb-4 p-8 flex justify-center items-center">
              <p 
            class="text-xl text-black font-open-sans font-bold">Beck</p>
            </button>
            <button 
            onClick={toggleBuilding} class="bg-gray-300 w-full rounded-2xl w-8 h-8 p-8 flex justify-center items-center">
              <p 
            class="text-xl text-black font-open-sans font-bold">CTLM</p>
            </button>
          </div>
          <div class={`flex flex-col items-center justify-center bg-grey-300 transition-all ease-in-out duration-500 ${inBuilding() ? 'w-56 opacity-full ms-4' : 'w-0 opacity-0'}`}>
            <button
              class="mb-4 w-16 h-16 bg-white rounded-full flex justify-center items-center"
              onClick={() => inBuilding() ?
                setCurrFloor((floor) => {
                  if (floor + 1 >= building.floors.length) return floor;
                  building.up();
                  return floor + 1;
                }) : null}
            >
              <img src={upArrow} alt="go up" class="w-8 h-8" />
            </button>
            <p class="mb-4 text-black text-4xl font-open-sans text-white font-bold">
              {currFloor() + 1}
            </p>
            <button
              class="w-16 h-16 rounded-full bg-white flex justify-center items-center"
              onClick={() => inBuilding() ?
                setCurrFloor((floor) => {
                  if (floor - 1 < 0) return floor;
                  if (!inBuilding()) return floor;
                  building.down();
                  return floor - 1;
                }) : null
              }
            >
              <img src={downArrow} alt="go down" class="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
