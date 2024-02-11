import { createSignal, createEffect } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Building } from "./map/Building";
import { BigMap } from "./map/BigMap";

import upArrow from "../assets/arrow_upward.svg";
import downArrow from "../assets/arrow_down.svg";

export interface HomeProps {
  inheritSize: boolean;
}

export default function Home(props: HomeProps) {
  const [inBuilding, setInBuilding] = createSignal(false);
  const [currentRoom, setCurrentRoom] = createSignal(undefined);

  // animation stuff
  var minCameraY = 5;
  var maxCameraY = 8;
  // var targetCameraX = -0.17;
  var targetCameraY = null;
  // var targetCameraZ = 0.17;
  var inAnimation = false;
  const ANIMATION_SPEED = 0.15;

  var building = new Building("McNeil", "MC", 1, [
    "/model/floor1.glb",
    "/model/floor2.glb",
  ]);

  var bigMap = new BigMap("/model/fullmap.glb");

  const [currFloor, setCurrFloor] = createSignal(building.currFloor);

  const toggleBuilding = () => {
    if (inBuilding()) {
      // building.leave();
      setInBuilding(false);
      minCameraY = 5;
      maxCameraY = 8;
      targetCameraY = 8;
      bigMap.show();
    } else {
      building.enter();
      bigMap.hide();
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
    scene.background = new THREE.Color(0x4f4e4b);

    // camera
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 5;
    camera.rotation.x = -90;

    // mouse clicking
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
            setCurrentRoom(intersects[i].object.room)
          }
        }
      }
      setup = true;
    }

    // renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    if (props.inheritSize) {
      renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
    } else {
      renderer.setSize(document.body.clientWidth, document.body.clientHeight);
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    mapContainer.appendChild(renderer.domElement);

    // controls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null,
    };
    controls.enableRotation = false;

    // load big map
    bigMap.load(scene);

    // load building
    building.load(scene);
    setCurrFloor(building.currFloor);

    // Create a light source and enable it to cast shadows
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0.5, -1);
    light.castShadow = true; // default false
    light.shadow.mapSize.width = 1024; // default
    light.shadow.mapSize.height = 1024; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    light.shadow.camera.top = 1;
    light.shadow.camera.bottom = -1;
    light.shadow.camera.left = -1;
    light.shadow.camera.right = 1;
    light.shadow.camera.visible = true;
    scene.add(light);

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
          let pos = camera.position;
          pos.y = pos.y+(targetCameraY-pos.y)*ANIMATION_SPEED;
          if (Math.abs(pos.y-targetCameraY) < 0.01) inAnimation = false;
        if (inAnimation) {
          camera.position.y +=
            (targetCameraY - camera.position.y) * ANIMATION_SPEED;
          camera.position.x +=
            (targetCameraX - camera.position.x) * ANIMATION_SPEED;
          camera.position.z +=
            (targetCameraZ - camera.position.z) * ANIMATION_SPEED;
          if (Math.abs(camera.position.y - targetCameraY) < 0.01)
            inAnimation = false;
        } else {
          if (camera.position.y < minCameraY) camera.position.y = minCameraY;
          if (camera.position.y > maxCameraY) camera.position.y = maxCameraY;
        }
        
        camera.rotation.set(-Math.PI / 2 + Math.PI / 30, 0, 0); // <-- bugs happen without this :(

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
      }
    };
    animate();
  }, []);
  return (
    <div>
      <div class="h-full w-full" ref={mapContainer} />
      <div class="absolute top-0 left-0">
        <div class="bg-gray-500 rounded-3xl p-6 m-4 w-96 flex flex-col transition-all ease-in-out gap-4 duration-500">
          <div class="flex flex-row transition-all ease-in-out duration-500">
            <div class="w-full col-span-1">
              <button
                onClick={toggleBuilding}
                class={`w-full rounded-2xl w-8 h-8 mb-4 p-8 flex justify-center items-center transition-all ease-in-out duration-500 content-box ${
                  inBuilding() ? "text-black bg-gray-400" : "bg-gray-300"
                }`}
              >
                <p class="text-xl font-open-sans font-bold">McNeil Hall</p>
              </button>
              <button
                onClick={toggleBuilding}
                class="bg-gray-300 w-full rounded-2xl w-8 h-8 mb-4 p-8 flex justify-center items-center"
              >
                <p class="text-xl text-black font-open-sans font-bold">Beck</p>
              </button>
              <button
                onClick={toggleBuilding}
                class="bg-gray-300 w-full rounded-2xl w-8 h-8 p-8 flex justify-center items-center"
              >
                <p class="text-xl text-black font-open-sans font-bold">CTLM</p>
              </button>
            </div>
          </div>
        </div>
        <div class={`bg-gray-500 rounded-3xl p-6 m-4 w-96 flex flex-col transition-all ease-in-out gap-4 duration-500 ${inBuilding() ? "translate-y-0 opacity-full" : "translate-y-60 opacity-0"}`}>
            <div
              class={`flex flex-row items-center w-full justify-around bg-grey-300 transition-all ease-in-out duration-500}}`}
            >
              <button
                class="w-16 h-16 bg-white rounded-full flex justify-center items-center"
                onClick={() =>
                  inBuilding()
                    ? setCurrFloor((floor) => {
                        if (floor + 1 >= building.floors.length) return floor;
                        setCurrentRoom(undefined);
                        building.up();
                        return floor + 1;
                      })
                    : null
                }
              >
                <img src={upArrow} alt="go up" class="w-8 h-8" />
              </button>
              <p class="text-black text-4xl font-open-sans text-white font-bold">
                {currFloor() + 1}
              </p>
              <button
                class="w-16 h-16 rounded-full bg-white flex justify-center items-center"
                onClick={() =>
                  inBuilding()
                    ? setCurrFloor((floor) => {
                        if (floor - 1 < 0) return floor;
                        if (!inBuilding()) return floor;
                        setCurrentRoom(undefined);
                        building.down();
                        return floor - 1;
                      })
                    : null
                }
              >
                <img src={downArrow} alt="go down" class="w-8 h-8" />
              </button>
            </div>
          {building.floors[inBuilding() ? currFloor() : currFloor()].rooms.length > 1 ? 
          <div class="grid grid-cols-2 gap-2">
            
            {building.floors[inBuilding() ? currFloor() : currFloor()].rooms.map((room) => (
              <button
                class={`bg-gray-300 w-full rounded-full col-span-1 h-12 p-4 flex justify-center items-center 
                ${currentRoom() !== undefined && currentRoom().name === room.name ? "bg-gray-400" : "bg-gray-300"}`}
                onClick={() => setCurrentRoom(room)}
              >
                  <p class="text-xl text-black font-open-sans font-bold">{room.name}</p>
              </button>
            ))}
          </div>: null}
        </div>
      </div>
    </div>
  );
}
