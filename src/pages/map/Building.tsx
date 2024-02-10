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
    
    this.showFloor(1);
    return this;
  }

  up() {
    if (this.currFloor + 1 >= this.floors.length){
      return this;
    }
    this.showFloor(this.currFloor + 1);
    return this;
  }

  down() {
    if (this.currFloor - 1 < 0){
      return this;
    }
    this.showFloor(this.currFloor - 1);
    return this;
  }

  showFloor(newFloor){
    this.currFloor = newFloor;
    for (let i = 0; i < this.floors.length; i++){
      if (i <= newFloor){
        // console.log("showing floor " + i);
        this.floors[i].show();
      } else {
        // console.log("hiding floor " + i);
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