import { Building } from './Building';
import { Room } from './Room';

export class Floor {
  building: Building
  modelPath: string;
  // Want to use a Promise here so that we can load the model
  // while not crashing when we initialize the state. Ideally
  // this would be better served by decoupling the model from
  // the floor. 
  // Promise refactor done by GitHub copilot
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
        // Advised by github copilot to make smoother shadows
        object.castShadow = true;
        object.receiveShadow = true;
        object.position.x = 0.5;
        object.position.z = -1;
        scene.add(object);
        thisReference.model = object;
        for (const child of glb.scene.children) {
          // Only want children whose names are entirely numbers
          // parseInt will still parse strings like 123mesh, so
          // we also need to filter those too.
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