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
        glb.scene.castShadow = true; //default is false
        glb.scene.receiveShadow = true; //default is false
        glb.scene.position.x = 0.5;
        glb.scene.position.z = -1;
        scene.add(glb.scene);
        resolve(glb.scene);
      }, undefined, function (error) {console.error(error); reject(error);});
    });
  }
}