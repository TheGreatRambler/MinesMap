import { CanvasTexture, SpriteMaterial, Sprite, Box3 } from 'three';
import { Building } from './Building';

export class Room {
  x: number;
  y: number;
  z: number;
  building: Building;
  number: number;
  name: string;
  sprite: Sprite;

  constructor(x: number, y: number, z: number, building: Building, number: number){
    this.x = x;
    this.y = y;
    this.z = z;
    this.building = building;
    this.number = number;
    this.name = building.code + number;
  }

  load(scene) {
      // Create a 128x64 canvas and draw text
      const canvas = document.createElement('canvas');
      canvas.width = 126;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      
      // Draw a fully rounded pill shape in the background
      // This was generated w/github copilot
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

      // Github copilot assisted with this
      // Draw white text on front of the background
      context.font = '40px Arial';
      context.fillStyle = 'white';
      // Center the text vertically and horizontally, while
      // clamping it to the padded width of the canvas.
      context.fillText(this.name, 8, 45, 112);

      // Convert canvas to sprite
      const canvasTexture = new CanvasTexture(canvas);
      const spriteMaterial = new SpriteMaterial({ map: canvasTexture });
      const sprite = new Sprite(spriteMaterial);

      // Default size is too big for a label, scale it down
      sprite.scale.set(0.125 / 2, 0.125 / 4, 1);
      sprite.position.set(this.x, this.y, this.z);

      // Shfit positions to align with the rest of the building
      sprite.position.x += 0.5;
      sprite.position.z -= 1;

      // We will need the room later when we check for clicks
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