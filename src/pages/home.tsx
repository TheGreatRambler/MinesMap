import { createSignal, createEffect, onMount } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { Building } from "./map/Building";
import { BigMap } from "./map/BigMap";

import upArrow from "../assets/arrow_upward.svg";
import downArrow from "../assets/arrow_down.svg";
import EventList from "./events/EventList";

export interface HomeProps {
  inheritSize: boolean;
}

export default function Home(props: HomeProps) {
  const [inBuilding, setInBuilding] = createSignal(false);
  const [currentRoom, setCurrentRoom] = createSignal(undefined);
  const [websocket, setWebsocket] = createSignal<WebSocket | null>(null);
  const [camera, setCamera] = createSignal<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = createSignal<OrbitControls | null>(null);

  onMount(() => {
    const ws = new WebSocket('ws://10.60.211.99:3001/gestures/read');
    setWebsocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      // Handle user gestures from external device
      // This is a proof of concept for usage in display environments
      // Payloads are formatted as TYPE:DIRECTION:DISTANCE, except
      // when DISTANCE or DISTANCE is not applicable, in which we use
      // numbers instead.
      // Assisted with GitHub copilot.
      const entries = event.data.split(':');
      const type = entries[0];
      const direction = entries[1];
      const distance = entries[2] / 500; // Make strength of gestures less sesnitive
      // Swipe -> Forward to drag/pan event
      // Pinch -> Forward to scroll/zoom event
      // Tap -> Forward to tap event
      if (type === 'PINCH') {
        if (direction === 'UP') {
          camera().position.y -= distance;
        } else if (direction === 'DOWN') {
          camera().position.y += distance;
        }
      } else if (type === 'PAN') {
        if (direction === 'UP') {
          camera().position.z -= distance;
        } else if (direction === 'DOWN') {
          camera().position.z += distance;
        } else if (direction === 'LEFT') {
          camera().position.x -= distance;
        } else if (direction === 'RIGHT') {
          camera().position.x += distance;
        }
        controls().target.set(camera().position.x, 0, camera().position.z);
        controls().update();
      } else if (type === 'TAP') {
        // Simulate mouse click on center of window
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        });
        window.dispatchEvent(event);
      } else if (type === 'PRESS') {
        if (currentRoom() !== undefined) {
          setCurrentRoom(undefined);
        } else if (inBuilding()) {
          toggleBuilding();
        }
      } else if (type === 'SWIPE' && inBuilding()) {
        if (direction === 'LEFT') {
          setCurrFloor((floor) => {
              if (floor - 1 < 0) return floor;
              if (!inBuilding()) return floor;
              setCurrentRoom(undefined);
              building.down();
              shiftCamera(true);
              return floor - 1;
            })
        } else if (direction === 'RIGHT' && inBuilding()) {
          setCurrFloor((floor) => {
            if (floor + 1 >= building.floors.length) return floor;
              if (!inBuilding()) return floor;
            setCurrentRoom(undefined);
            building.up();
            shiftCamera(false);
            return floor + 1;
          })
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  })

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
      minCameraY = 0.3 + FLOOR_HEIGHT*currFloor();
      maxCameraY = 1.1 + FLOOR_HEIGHT*currFloor();
      targetCameraY = maxCameraY;
    }
    inAnimation = true;
  };

  const shiftCamera = (isDown) => {
    if (inBuilding()){
      if (isDown){
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
    setCamera(camera);

    // mouse clicking
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    // Proposed by GitHub copilot
    if (!setup) {
      window.addEventListener("click", onDocumentMouseClick, false);

      function onDocumentMouseClick(event) {
        event.preventDefault();

        // Need to normalize the mouse cooridnates into the range used by
        // graphics.
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Then use a raycaster to find all of the objects intersecting
        // with the oriented camera.
        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(scene.children, true); 
        for (let i = 0; i < intersects.length; i++) {
          if (intersects[i].object instanceof THREE.Sprite) {
            // Pointing at a room label, show it
            setCurrentRoom(undefined)
            setCurrentRoom(intersects[i].object.room)
          }

          if (!inBuilding()){
            // Pointing at a building, enter it.
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
    // Useful if you want to embed the map into other contexts.
    if (props.inheritSize) {
      renderer.setSize(mapContainer.clientWidth, mapContainer.clientHeight);
    } else {
      renderer.setSize(document.body.clientWidth, document.body.clientHeight);
    }
    // Useful for making shadows look better
    // Advised by GitHub copilot
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mapContainer.appendChild(renderer.domElement);

    // controls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null,
    };
    controls.enableRotate = false;
    setControls(controls);

    // load big map
    bigMap.load(scene);
    console.log(bigMap)

    // load building
    building.load(scene);
    setCurrFloor(building.currFloor);

    // Create a light source and enable it to cast shadows without being
    // too intense.
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
      // Make shadows look better
      // Advised by GitHub copilot
      light.castShadow = true;
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

    controls.update();

    var animate = function () {
      requestAnimationFrame(animate);
      now = Date.now();
      delta = now - then;

      if (delta > interval) {
        // animation stuff
        // to be honest, i dont even know how this works
        if (inAnimation){
          let pos = camera.position;
          let dy = (targetCameraY-pos.y)*ANIMATION_SPEED;
          let dx = (targetCameraX-pos.x)*ANIMATION_SPEED;
          let dz = (targetCameraZ-pos.z)*ANIMATION_SPEED;
          pos.add(new THREE.Vector3(dx, dy, dz));
          camY = pos.y;
          controls.target.set(pos.x, 0, pos.z);
          if (Math.abs(pos.y-targetCameraY) < 0.001) inAnimation = false;
        } else {
          if (camera.position.y < minCameraY) camera.position.y = minCameraY;
          if (camera.position.y > maxCameraY) camera.position.y = maxCameraY;
        }
        controls.update();

        // limit frame rate to reduce load
        // written by github copilot
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
                class={`w-full rounded-2xl w-8 h-8 p-8 flex justify-center items-center transition-all ease-in-out duration-500 content-box ${
                  inBuilding() ? "text-black bg-gray-400" : "bg-gray-300"
                }`}
              >
                <p class="text-xl font-open-sans font-bold">McNeil Hall</p>
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
                      // We currently have two copies of the current room across different state. Don't ask.
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
                      // We currently have two copies of the current room across different state. Don't ask.
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
                  // Need to flip back to undefined to get it to refresh
                    setCurrentRoom(undefined);
                    setCurrentRoom(room);
                  }
                }}
              >
                  <p class="text-xl text-black font-open-sans font-bold">{room.name}</p>
              </button>
            ))}
          </div>: null}
        </div>
        <div class={`bg-gray-500 rounded-3xl p-6 m-4 w-96 flex flex-col transition-all ease-in-out gap-4 duration-500 ${currentRoom() !== undefined ? "translate-y-0 opacity-full" : "translate-y-60 opacity-0"}`}>
            <div
              class={`flex flex-row items-center w-full justify-around bg-grey-300 transition-all ease-in-out duration-500}}`}
            >
              <p class="text-black text-4xl font-open-sans text-white font-bold">
                Events
              </p>
            </div>
            {/* Show an event list if we have selected a room (vaguely) */}
              { currentRoom() !== null && currentRoom() !== undefined ? <EventList class="" room={currentRoom()} /> : null }
        </div>
      </div>
    </div>
  );
}
