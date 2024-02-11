import { createSignal, createEffect } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Building } from "./map/Building";
import { BigMap } from "./map/BigMap";

import upArrow from "../assets/arrow_upward.svg";
import downArrow from "../assets/arrow_down.svg";

import locations from "../assets/locations.js";
import EventList from "./events/EventList";

export interface HomeProps {
  inheritSize: boolean;
}

export default function Home(props: HomeProps) {
  const [inBuilding, setInBuilding] = createSignal(false);
  const [currentRoom, setCurrentRoom] = createSignal(undefined);

  // animation stuff
  var minCameraY = 5;
  var maxCameraY = 8;
  const targetCameraX = -0.17;
  var targetCameraY = null;
  const targetCameraZ = 0.17;
  var inAnimation = false;
  const ANIMATION_SPEED = 0.15;
  const FLOOR_HEIGHT = 0.08;
  var camY = 0;

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
      setCurrentRoom(undefined);
      minCameraY = 6;
      maxCameraY = 10;
      targetCameraY = 10;
      bigMap.show();
    } else {
      building.enter();
      bigMap.hide();
      setCurrFloor(building.defaultFloor);
      setInBuilding(true);
      minCameraY = 0.3 + FLOOR_HEIGHT * currFloor();
      maxCameraY = 1.1 + FLOOR_HEIGHT * currFloor();
      targetCameraY = maxCameraY;
    }
    inAnimation = true;
  };

  const shiftCamera = (isDown) => {
    if (inBuilding()) {
      if (isDown) {
        minCameraY -= FLOOR_HEIGHT;
        maxCameraY -= FLOOR_HEIGHT;
        targetCameraY = camY - FLOOR_HEIGHT;
      } else {
        minCameraY += FLOOR_HEIGHT;
        maxCameraY += FLOOR_HEIGHT;
        targetCameraY = camY + FLOOR_HEIGHT;
      }
      inAnimation = true;
    }
  }

  let setup = false;

  let mapContainer: HTMLDivElement;
  createEffect(() => {
    // scene
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xA3CE79);

    // camera
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camY = 5;
    camera.position.y = camY;
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
          // check for labels
          if (intersects[i].object instanceof THREE.Sprite) {
            setCurrentRoom(undefined)
            setCurrentRoom(intersects[i].object.room)
          }
          // check for building
          if (!inBuilding()) {
            if (intersects[i].object.name == "map_(1)osm_buildings008_1" || intersects[i].object.name == "map_(1)osm_buildings008_2") {
              toggleBuilding();
            }
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
    controls.enableRotate = false;

    // load big map
    bigMap.load(scene);
    console.log(bigMap)

    // load building
    building.load(scene);
    setCurrFloor(building.currFloor);

    // Create a light source and enable it to cast shadows
    const lights = [
      new THREE.DirectionalLight(0xffffff, 1),
      new THREE.DirectionalLight(0xffffff, 1),
      new THREE.DirectionalLight(0xffffff, 1),
      new THREE.DirectionalLight(0xffffff, 1)
    ];

    lights[0].position.set(0, 12, 0);
    lights[1].position.set(25, 12, 0);
    lights[2].position.set(-25, 12, 0);
    lights[3].position.set(0, 12, 25);

    for (const light of lights) {
      light.castShadow = true;
      // Set shadow map size
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      scene.add(light);
    }

    // animate();
    var fps = 30;
    var now;
    var then = Date.now();
    var interval = 1000 / fps;
    var delta;

    var renderer360Open = false;
    var cameraOffscreen360X = 0;
    var cameraOffscreen360Y = -1000;
    var cameraOffscreen360Z = 0;
    var cameraLast360X = 0;
    var cameraLast360Y = 0;
    var cameraLast360Z = 0;
    var renderer360Open = false;

    controls.update();

    var animate = function () {
      requestAnimationFrame(animate);
      now = Date.now();
      delta = now - then;

      if (delta > interval) {
        // animation stuff
        if (!renderer360Open) {
          if (inAnimation) {
            let pos = camera.position;
            let dy = (targetCameraY - pos.y) * ANIMATION_SPEED;
            let dx = (targetCameraX - pos.x) * ANIMATION_SPEED;
            let dz = (targetCameraZ - pos.z) * ANIMATION_SPEED;
            pos.add(new THREE.Vector3(dx, dy, dz));
            camY = pos.y;
            controls.target.set(pos.x, 0, pos.z);
            if (Math.abs(pos.y - targetCameraY) < 0.001) inAnimation = false;
          } else {
            if (camera.position.y < minCameraY) camera.position.y = minCameraY;
            if (camera.position.y > maxCameraY) camera.position.y = maxCameraY;
          }
          controls.update();
        }

        if (camera.position.y < (0.3 + FLOOR_HEIGHT * currFloor() + 0.1) && !renderer360Open) {
          renderer360Open = true;

          let minimum = Infinity;
          let minimumEntry = "";

          for (let i = 0; i < locations.length; i++) {
            let entry = locations[i];

            let x = entry[1].x;
            let y = entry[1].y;
            let distance = Math.pow(camera.position.x - x, 2) + Math.pow(camera.position.y - y, 2);

            if (distance < minimum) {
              minimum = distance;
              minimumEntry = entry[0] as string;
            }
          }

          let mat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`/360_images/${minimumEntry}.png`) });
          mat.side = THREE.BackSide;
          let mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 60, 40), mat);

          mesh.position.set(cameraOffscreen360X, cameraOffscreen360Y, cameraOffscreen360Z);
          scene.add(mesh);

          cameraLast360X = camera.position.x;
          cameraLast360Y = camera.position.y;
          cameraLast360Z = camera.position.z;

          camera.position.x = cameraOffscreen360X;
          camera.position.y = cameraOffscreen360Y;
          camera.position.z = cameraOffscreen360Z;

          let escapeHandler = (event) => {
            const keyName = event.key;
            if (keyName === "Escape") {
              renderer360Open = false;

              controls.target.set(cameraLast360X, 0, cameraLast360Z);

              document.removeEventListener("keydown", escapeHandler);

              // Remove mesh entirely
              scene.remove(mesh);
              mesh.geometry.dispose();
              mesh.material.dispose();
              mesh = undefined;

              camera.rotation.x = -1.5707953267948966;
              camera.rotation.y = 0;
              camera.rotation.z = 0;

              camera.position.x = cameraLast360X;
              camera.position.y = cameraLast360Y + 0.5;
              camera.position.z = cameraLast360Z;
            }
          };

          document.addEventListener("keydown", escapeHandler, false);
        }

        if (renderer360Open) {
          camera.position.x = cameraOffscreen360X;
          camera.position.y = cameraOffscreen360Y;
          camera.position.z = cameraOffscreen360Z;
        }

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
    }
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
                class={`w-full rounded-2xl w-8 h-8 p-8 flex justify-center items-center transition-all ease-in-out duration-500 content-box ${inBuilding() ? "text-black bg-gray-400" : "bg-gray-300"
                  }`}
              >
                <p class="text-xl font-open-sans font-bold">McNeil Hall</p>
              </button>
              {/*               <button
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
              </button> */}
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
                    shiftCamera(false);
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
                    shiftCamera(true);
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
                  onClick={() => {
                    if (currentRoom() === room) {
                      setCurrentRoom(undefined);
                    } else {
                      setCurrentRoom(undefined);
                      setCurrentRoom(room);
                    }
                  }}
                >
                  <p class="text-xl text-black font-open-sans font-bold">{room.name}</p>
                </button>
              ))}
            </div> : null}
        </div>
        <div class={`bg-gray-500 rounded-3xl p-6 m-4 w-96 flex flex-col transition-all ease-in-out gap-4 duration-500 ${currentRoom() !== undefined ? "translate-y-0 opacity-full" : "translate-y-60 opacity-0"}`}>
          <div
            class={`flex flex-row items-center w-full justify-around bg-grey-300 transition-all ease-in-out duration-500}}`}
          >
            <p class="text-black text-4xl font-open-sans text-white font-bold">
              Events
            </p>
          </div>
          {currentRoom() !== null && currentRoom() !== undefined ? <EventList class="" room={currentRoom()} /> : null}
        </div>
        <div class={`bg-gray-500 rounded-3xl p-6 m-4 w-96 flex flex-col transition-all ease-in-out gap-4 duration-500 ${currentRoom() !== undefined ? "translate-y-0 opacity-full" : "translate-y-60 opacity-0"}`}>
          <div
            class={`flex flex-row items-center w-full justify-around bg-grey-300 transition-all ease-in-out duration-500}}`}
          >
            <p class="text-black text-4xl font-open-sans text-white font-bold">
              Events
            </p>
          </div>
          {currentRoom() !== null && currentRoom() !== undefined ? <EventList class="" room={currentRoom()} /> : null}
        </div>
      </div>
    </div>
  );
}
