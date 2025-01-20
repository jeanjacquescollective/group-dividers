import Boundary from './boundary.js';
import Particle from './particle.js';
import Peg from './peg.js';
import { Engine, World, world, particles, pegs, boundaries, particleFrequency, columns, rows, setWorld, pointZones } from './globals.js'
import ShowGroups from './showgroups.js';



let engine;
let font,
    fontSize = 40;

let pointZoneLength = Object.keys(pointZones).length;
let groups = Array.from({ length: pointZoneLength }, () => []);

/**
 * Preloads the font before drawing canvas.
 * 
 * Zach Robinson.
 */
function preload() {
    font = loadFont('assets/OpenSans-Bold.ttf');
}

 

/**
 * Sets up the engine, world, gravity, and font properties. Initializes canvas to beginning state.
 * 
 * Zach Robinson.
 */
function setup() {
    engine = Engine.create();
    let world = setWorld(engine.world);
    world.gravity.y = 2;

    textFont(font);
    textSize(fontSize);
    textAlign(CENTER, CENTER);

    initializeCanvas();
}

/**
 * Draws the canvas, calculates the spacing to be used when populating the initial static objects.
 * 
 * Zach Robinson.
 */
function initializeCanvas() {
    createCanvas(windowWidth, windowHeight);
    let spacing = width / columns;
    populatePegs(spacing);
    populateCanvasBoundaries();
    let pointZoneSpacing = width / pointZoneLength;
    populatePointZones(pointZoneSpacing);

}

/**
 * Populates the pegs using a nested for loop. Some manipulation for the spacing
 * of individual rows. Pushes all pegs to the object array designed to hold them.
 * 
 * Zach Robinson.
 */
function populatePegs(spacing) {
    let radius = windowWidth / 200;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            let x = col * spacing + 12;
            if (row % 2 == 1)
                x += spacing / 2;
            let y = spacing + row * spacing;
            if (y > height - 100 || y < 100) {
                continue;
            }
            else {
                let p = new Peg(x, y, radius);
                pegs.push(p);
            }

        }
    }
}

/**
 * Populates the point zones using a for loop. Pushes all boundary objects
 * to the object array designed to hold them.
 * 
 * Zach Robinson.
 */
function populatePointZones(spacing) {
    for (let i = 0; i < pointZoneLength; i++) {
        let h = 150;
        let w = 5;
        let x = i * spacing - w / 2;
        let y = height - h / 2;
        let wall = new Boundary(x, y, w, h);
        boundaries.push(wall);
    }
}

/**
 * Populates the canvas boundaries for the canvas. These will prevent the particles
 * from falling off the edges or out from the bottom. Pushes all boundary objects
 * to the array designed to hold them.
 * 
 * Zach Robinson and Thomas Schwartz.
 */
function populateCanvasBoundaries() {
    let bottomHeight = 100;
    let bottomXCoord = width / 2;
    let bottomYCoord = height + bottomHeight / 2;

    let sideWidth = 50;
    let leftXCoord = -1 * sideWidth / 2;
    let rightXCoord = width + sideWidth / 2;
    let sideYCoord = height / 2;

    let left = new Boundary(leftXCoord, sideYCoord, sideWidth, height);
    let right = new Boundary(rightXCoord, sideYCoord, sideWidth, height);
    let bottom = new Boundary(bottomXCoord, bottomYCoord, width, bottomHeight);

    boundaries.push(bottom, left, right);
}

/**
 * Creates a new particle with default settings and pushes it
 * to the object array designed to hold it.
 * 
 * Zach Robinson.
 */
function createNewParticle() {
    particles.length = 0;
    groups = Array.from({ length: pointZoneLength }, () => []);
    let names = JSON.parse(localStorage.getItem('names')) || [];
    names.forEach(name => {
        let p = new Particle(windowWidth/2, 0, 20, name);
        particles.push(p);
    });
    if (names.length == 0) {
        let p = new Particle(300, 0, 12);
        particles.push(p);
    }
}

/**
 * Removes all particles both from the physics engine and the object
 * array used to draw them. 
 * 
 * Zach Robinson.
 */

function resetSketch(){
    removeAllParticles();

    loop();
    document.querySelector('.defined-groups-wrapper').classList.add('hidden');
    document.querySelector('#particles-drop').disabled = false;
    
}
function removeAllParticles() {
    for (let i = 0; i < particles.length; i++)
        World.remove(world, particles[i].body);
    particles.splice(0, particles.length);
}

/**
 * Removes a single particle at a particular count.
 * Used in case a particle falls through the canvas boundaries.
 * 
 * Zach Robinson.
 */
function removeParticle(counter) {
    World.remove(world, particles[counter].body);
    particles.splice(counter, 1);
}

/**
 * Draws and displays all particles in the object array. Includes a 
 * validation check for if particle is off screen.
 * 
 * Zach Robinson.
 */
function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].show();
        if (particles[i].isOffScreen())
            removeParticle(i--);
    }
}

/**
 * Draws all pegs in the object array.
 * 
 * Zach Robinson.
 */
function drawPegs() {
    for (let i = 0; i < pegs.length; i++) {
        pegs[i].show();
    }
}

/**
 * Draws all boundary objects in the object array.
 * 
 * Zach Robinson.
 */
function drawBoundaries() {
    for (let i = 0; i < boundaries.length; i++) {
        boundaries[i].show();
    }
}

/**
 * Draws the labels for any particular point zone on the canvas.
 * Uses a for loop and delta to count forward and backward, so the
 * point values can be adjusted dynamically using global letiables.
 * 
 * Zach Robinson.
 */
function drawPointLabels() {
    let point = 1;
    let delta = 1;
    let length = pointZoneLength;
    let yCoord = height - 50;
    let zoneWidth = width / length;
    let offset = zoneWidth / 2 - 2;

    for (let i = 0; i < length; i++) {
        let xCoord = zoneWidth * i + offset;
        drawLabel(point.toString(), xCoord, yCoord);
        // if (point == max)
        //     delta *= -1;
        point += delta;
    }

    /**
     * Draws a particular point label.
     * @param {string} value Point value to be associated with label.
     * @param {number} x X coordinate where label should be drawn.
     * @param {number} y Y coordinate where label should be drawn.
     * 
     * Zach Robinson.
     */
    function drawLabel(value, x, y) {
        fill(185);
        stroke(185);
        text(value, x, y);
    }
}

/**
 * Assigns a point value to the pointValue property of all particle
 * objects in the particles array if it has fallen past the stated threshold.
 * Calculates and displays the sum after assigning values.
 * 
 * Zach Robinson.
 */
function assignPointValuesAndDisplay() {
    let threshold = height - 100;   // vertical threshold particles must pass
    let sum = 0;
    let zoneWidth = width / pointZoneLength;

    particles.forEach(setParticlePointValue)
    displaySum();

    /**
     * Sets the point value of a given Particle object to 
     * a particular value.
     * 
     * Zach Robinson.
     * 
     * @param {Object} particle - The particle whose pointValue property will be mutated.
     * @param {number} particle.pointValue - The point value that this particle has earned.
     */
    function setParticlePointValue(particle) {
        let yCoord = particle.body.position.y;
        if (yCoord >= threshold) {
            let xCoord = particle.body.position.x;
            let zone = pointZones(xCoord) - 1;

            if (!groups[zone]) {
                groups[zone] = [];
            }

            const maxParticlesPerZone = Math.round(particles.length / pointZoneLength);
            const isParticleInZone = groups[zone].some(p => p.id === particle.id);
            const particlesInGroups = groups.reduce((acc, val) => acc + val.length, 0);
            if (groups[zone].length > maxParticlesPerZone) {
                console.log('Too many particles in zone', zone);

                if (groups[zone].length % Math.round(particles.length -  particlesInGroups/ pointZoneLength) === 0 && !isParticleInZone) {
                    groups[zone].push(particle);
                } else {

                    let lastParticle = groups[zone].pop();
                    if (lastParticle) {
                        let minZone = groups.reduce((acc, val, index) => val.length < groups[acc].length ? index : acc, 0);
                        console.log('minZone', minZone);
                        console.log(groups);
                        let zoneMiddle = minZone * zoneWidth + zoneWidth / 2;
                        lastParticle.reset(zoneMiddle, 0);
                    }
                }
            } else if (!isParticleInZone) {
                groups[zone].push(particle);
            }
            if (particles.length -  particlesInGroups === 0) {
                noLoop();
                document.querySelector('.defined-groups-wrapper').classList.remove('hidden');   
                document.querySelector('#particles-drop').disabled = true;
                const showgroups = new ShowGroups(groups);
                showgroups.show();
            }

            // console.log(groups);
            // particle.setPointValue(pointZones(xCoord));
        }
    }

    /**
     * Calculates and returns the point associated with the latest
     * Particle that has scored.
     * 
     * Zach Robinson.
     * 
     * @param {number} xCoord Will be used to calculate the appropriate score.
     */
    function pointZones(xCoord) {
        let point = 1;
        let delta = 1;
        let length = pointZoneLength;
        let max = Math.round(length / 2);

        for (let i = 1; i <= length; i++) {
            let previous = zoneWidth * (i - 1);
            let current = zoneWidth * i;
            if (xCoord > previous && xCoord < current) {
                return point;
            }
            point += delta;
        }
        return 0;
    }

    /**
     * Displays the sum of all Particle's pointValues in the particles object array.
     * 
     * Zach Robinson.
     */
    function displaySum() {
        particles.forEach(p => sum += p.pointValue);
        // document.getElementById(totalScoreId).innerHTML = sum;
    }
}

/**
 * Runs on every frame. Draws all point labels, pegs, particles, and boundary objects.
 * Finally, iterates through all particles to determine current score and displays that
 * score on the web page.
 * 
 * Zach Robinson.
 */
function draw() {
    background(50);
    Engine.update(engine);
    drawPointLabels();
    drawPegs();
    drawParticles();
    drawBoundaries();

    assignPointValuesAndDisplay();
}

/**
 * Spawns particles per frame count rather than on button spawn.
 * Used for testing.
 * 
 * Zach Robinson.
 */
// function spawnParticles() {
//     if (frameCount % particleFrequency == 0) {
//         createNewParticle();
//     }
// }

window['setup'] = setup
window['draw'] = draw
window['preload'] = preload


window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#particles-drop').addEventListener('click', createNewParticle);
    document.querySelector('#particles-reset').addEventListener('click', resetSketch);
});
