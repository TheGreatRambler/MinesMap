import { Floor } from './Floor';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Building {
  name: string;
  code: string;
  floors: Floor[];
  defaultFloor: number;
  currFloor: number;

  constructor(name: string, code: string, defaultFloor: number, floorPaths: string[]){
    this.name = name;
    this.code = code;
    this.defaultFloor = defaultFloor;
    this.currFloor = defaultFloor;
    this.floors = [];
    for (const path of floorPaths){
      this.floors.push(new Floor(this, path));
    }
  }

  load(scene){
    const gltfloader = new GLTFLoader();
    for (let i = 0; i < this.floors.length; i++){
      this.floors[i].load(gltfloader, scene);
    }
    // Hard-code the second floor, we would want to change this
    // in a real product.
    this.showFloor(1);
    return this;
  }

  up() {
    if (this.currFloor + 1 >= this.floors.length){
      // Can't go any more up
      return this;
    }
    this.showFloor(this.currFloor + 1);
    return this;
  }

  down() {
    if (this.currFloor - 1 < 0){
      // Can't go any more down
      return this;
    }
    this.showFloor(this.currFloor - 1);
    return this;
  }

  showFloor(newFloor){
    this.currFloor = newFloor;
    for (let i = 0; i < this.floors.length; i++){
      if (i <= newFloor){
        this.floors[i].show();
      } else {
        // Hide floors above the current floor
        // so we can see the current floor interior
        this.floors[i].hide();
      }
    }
  }

  leave(){
    for (let i = 0; i < this.floors.length; i++){
      this.floors[i].hide();
    }
  }

  enter(){
    this.showFloor(this.defaultFloor);
  }

}