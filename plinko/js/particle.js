import { Bodies, World, world } from './globals.js';

export default class Particle {
    /**
     * The constructor for a Particle object.
     * 
     * Zach Robinson.
     * 
     * @param {number} x The x coordinate for where the object should be drawn.
     * @param {number} y The y coordinate for where the object should be drawn.
     * @param {number} r The radius of the particle object.
     */
    constructor(x, y, r, name = "particle") {

        this.options = {
            restitution: .8,
            friction: 0
        };
        x += random(-window.innerWidth/4, window.innerWidth/4);
        this.body = Bodies.circle(x, y, r, this.options);
        World.add(world, this.body);
        this.r = r;
        this.red = Math.max(Math.random() * 255, 20);
        this.green = Math.max(Math.random() * 255, 210);
        this.blue = Math.max(Math.random() * 255, 150);
        this.pointValue = 0;
        this.name = name;
        this.id = this.createUUID();
    }

    reset(xPos, yPos) {    
        World.remove(world, this.body);
        let x = Math.random() * window.innerWidth;
        let y = 0;
        if (xPos) {
            x = xPos + Math.random() * 50 - 25;
            
          
        }
        if (yPos) {
            y = yPos;
        }

        this.body = Bodies.circle(x, y, this.r, this.options);
        World.add(world, this.body);
    }

    

    createUUID(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Determines if the object is off of the canvas. Used to justify
     * whether the object should be removed from engine and draw array.
     * 
     * Zach Robinson.
     */
    isOffScreen() {
        let x = this.body.position.x;
        let y = this.body.position.y;
        return x < -50 || x > width + 50;
    }

    /**
     * Displays the Particle object at predetermined location and color
     * determined by the object's constructor.
     * 
     * Zach Robinson
     */
    show() {
        fill(this.red, this.green, this.blue);
        stroke(this.red, this.green, this.blue);
        push();
        let pos = this.body.position;
        translate(pos.x, pos.y);
        ellipse(0, 0, this.r * 2);
        fill(0);
        textAlign(CENTER, CENTER);
        let textSizeValue = Math.min(this.r/2, 20); // Adjust the maximum size as needed
        textSize(textSizeValue);
        text(this.name, 0, 0);
        pop();
    }

    /**
     * Sets the point value of the object.
     * 
     * Zach Robinson.
     * 
     * @param {number} value The point value that the property should inherit.
     */
    setPointValue(value) {
        if (typeof value === 'number')
            this.pointValue = value;
    }
}