


export class Floor {
  modelPath: string;
  model: any;

  constructor(modelPath: string){
    this.modelPath = modelPath;
    this.model = null;
  }

  load(gltfloader, scene){
    let thisReference = this;
    gltfloader.load(this.modelPath, function(glb) {
      let object = glb.scene;
      object.position.x = 0.5;
      object.position.z = -1;
      scene.add(object);
      thisReference.model = object;
      console.log(object);
    }, undefined, function (error) {console.error(error);});
  }

  show(){
    if (this.model){
      this.model.visible = true;
    }
  }

  hide(){
    if (this.model){
      this.model.visible = false;
    }
  }
}