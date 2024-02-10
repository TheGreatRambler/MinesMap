
import { CanvasTexture, SpriteMaterial, Sprite } from 'three';


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
      console.log(glb.scene)
      for (const child of glb.scene.children){
        // Ignore non-numeric names
        if (isNaN(parseInt(child.name))){
          continue;
        }

        // Create a canvas and draw text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '30px Arial';
        // Black background, white text
        context.fillStyle = 'white';
        // All room names are 3 digits, extend numbers as such.
        context.fillText("MC" + child.name.padStart(3, '0'), 10, 50);

        // Create a texture from the canvas
        const texture = new CanvasTexture(canvas);

        // Create a material with the texture
        const spriteMaterial = new SpriteMaterial({ map: texture });

        // Create a sprite with the material
        const sprite = new Sprite(spriteMaterial);
        console.log(child.position.x, child.position.y);
        sprite.position.x = child.position.x;
        sprite.position.z = child.position.z;
        sprite.position.y = 0

        scene.add(sprite)
      }
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