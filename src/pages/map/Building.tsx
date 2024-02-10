import { Floor } from './Floor';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Building {
  name: string;
  floors: Floor[];
  defaultFloor: number;
  currFloor: number;

  constructor(name, defaultFloor, floors){
    this.name = name;
    this.defaultFloor = defaultFloor;
    this.currFloor = defaultFloor;
    this.floors = floors;

  }

  load(scene){
    const gltfloader = new GLTFLoader();
    for (let i = 0; i < this.floors.length; i++){
      this.floors[i].load(gltfloader, scene);
    }
    this.showFloor(this.currFloor);
  }

  showFloor(newFloor){
    this.currFloor = newFloor;
    for (let i = 0; i < this.floors.length; i++){
      if (i == newFloor){
        this.floors[i].show();
      } else {
        this.floors[i].hide();
      }
    }
  }

  
}