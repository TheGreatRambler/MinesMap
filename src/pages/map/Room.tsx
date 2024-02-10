import { CanvasTexture, SpriteMaterial, Sprite, Box3 } from 'three';
import { Building } from './Building';

export class Room {
  x: number;
  y: number;
  z: number;
  name: string;
  sprite: Sprite;

  constructor(x: number, y: number, z: number, building: Building, number: number){
    this.x = x;
    this.y = y;
    this.z = z;
    this.name = building.code + number;
  }

  load(scene) {
      // Create a 128x64 canvas and draw text
      const canvas = document.createElement('canvas');
      canvas.width = 126;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      
      // Draw a fully rounded pill shape in the background
      context.beginPath();
      context.moveTo(0, 32);
      context.lineTo(0, 32);
      context.quadraticCurveTo(0, 0, 32, 0);
      context.lineTo(94, 0);
      context.quadraticCurveTo(126, 0, 126, 32);
      context.lineTo(126, 32);
      context.quadraticCurveTo(126, 64, 94, 64);
      context.lineTo(32, 64);
      context.quadraticCurveTo(0, 64, 0, 32);
      context.closePath();
      context.fillStyle = 'black';
      context.fill();


      context.font = '40px Arial';
      // // Black background, white text
      context.fillStyle = 'white';
      // // All room names are 3 digits, extend numbers as such.
      context.fillText(this.name, 8, 45, 112);

      // Create a texture from the canvas
      const texture = new CanvasTexture(canvas);

      // Create a material with the texture
      const spriteMaterial = new SpriteMaterial({ map: texture });

      // Create a sprite with the material
      const sprite = new Sprite(spriteMaterial);
      // Default size is too big for a label, scale it down
      sprite.scale.set(0.125 / 2, 0.125 / 4, 1);
      sprite.position.set(this.x, this.y, this.z);

      // Shfit positions to align with the rest of the building
      sprite.position.x += 0.5;
      sprite.position.z -= 1;

      sprite.room = this;

      this.sprite = sprite;

      scene.add(sprite)
  }

  show(){
    if (this.sprite){
      this.sprite.visible = true;
    }
  }

  hide(){
    if (this.sprite){
      this.sprite.visible = false;
    }
  }
}