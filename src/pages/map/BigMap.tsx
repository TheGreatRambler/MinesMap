import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class BigMap {
  modelPath: string
  model: Promise<any>

  constructor(modelPath){
    this.modelPath = modelPath;
    this.model = null;
  }

  load(scene){
    const gltfloader = new GLTFLoader();
    return this.model = new Promise((resolve, reject) => {
      gltfloader.load(this.modelPath, function(glb) {
        // Advised by github copilot to make smoother shadows
        glb.scene.castShadow = true;
        glb.scene.receiveShadow = true;
        glb.scene.scale.set(0.27,0.27,0.27);
        glb.scene.rotation.y = 2.5;
        glb.scene.position.x = 7.34;
        glb.scene.position.z = -8.63;
        scene.add(glb.scene);
        resolve(glb.scene);
      }, undefined, function (error) {console.error(error); reject(error);});
    });
  }

  async show(){
    const model = await this.model;
    if (model){
      model.visible = true;
    }
  }

  async hide(){
    const model = await this.model;
    if (model){
      model.visible = false;
    }
  }
}