import { Building } from './Building';
import { Room } from './Room';

export class Floor {
  building: Building
  modelPath: string;
  model: Promise<any>;
  rooms: Room[]

  constructor(building: Building, modelPath: string){
    this.building = building;
    this.modelPath = modelPath;
    this.model = null;
    this.rooms = [];
  }

  load(gltfloader, scene){
    let thisReference = this;
    return this.model = new Promise((resolve, reject) => {
      gltfloader.load(this.modelPath, function(glb) {
        let object = glb.scene;
        object.castShadow = true; //default is false
        object.receiveShadow = true; //default is false
        object.position.x = 0.5;
        object.position.z = -1;
        scene.add(object);
        thisReference.model = object;
        for (const child of glb.scene.children) {
          // Ignore children whose name entirely consists of numbers
          if (child.name.endsWith('mesh')) {
            continue;
          }
          const number = parseInt(child.name);
          if (isNaN(number)) {
            continue;
          }
          const room = new Room(child.position.x, child.position.y, child.position.z, thisReference.building, number);
          room.load(scene);
          thisReference.rooms.push(room);
        }
        resolve(object);
      }, undefined, function (error) {console.error(error); reject(error);});
    })
  }

  async show(){
    const model = await this.model;
    if (model){
      model.visible = true;
      for (const room of this.rooms){
        room.show();
      }
    }
  }

  async hide(){
    const model = await this.model;
    if (model){
      model.visible = false;
      for (const room of this.rooms){
        room.hide();
      }
    }
  }
}