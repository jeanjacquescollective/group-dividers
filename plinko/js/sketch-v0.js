import Boundary from './boundary.js';
import Particle from './particle.js';
import Peg from './peg.js';
import { Engine, World, world, particles, pegs, boundaries, particleFrequency, columns, rows, setWorld, pointZones, wallHeight } from './globals.js'
import ShowGroups from './showgroups.js';



let engine;
let font,
    fontSize = 40;

let pointZoneLength = Object.keys(pointZones).length;
let groups = Array.from({ length: pointZoneLength }, () => []);
let maxParticlesPerGroup = [];

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
    world.gravity.y = 3;

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
            if (y > height - wallHeight || y < 100) {
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
        let h = wallHeight;
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
    resetGroups();
    let names = JSON.parse(localStorage.getItem('names')) || [];
    names.forEach(name => {
        let p = new Particle(windowWidth / 2, 0, 20, name);
        particles.push(p);
    });
    if (names.length == 0) {
        let p = new Particle(300, 0, 12);
        particles.push(p);
    }
}

function resetGroups() {
    groups.length = 0;
    groups = Array.from({ length: pointZoneLength }, () => []);
}

function createNewParticles() {
    particles.length = 0;
    let names = JSON.parse(localStorage.getItem('names')) || [];
    names.forEach(name => {
        let p = new Particle(windowWidth / 2, 0, 20, name);
        particles.push(p);
    });
    return particles;
}

/**
 * Removes all particles both from the physics engine and the object
 * array used to draw them. 
 * 
 * Zach Robinson.
 */

function resetSketch() {
    removeAllParticles();
    loop();
    document.querySelector('.defined-groups-wrapper').classList.add('hidden');
    document.querySelector('#particles-drop').disabled = false;
    resetGroups();

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

function checkParticles() {
    // if the particles array is empty, return mostly at the beginning of the sketch
    if (particles.length === 0) {
        return;
    }
    let threshold = height - 50;   // vertical threshold particles must pass
    let sum = 0;
    let zoneWidth = width / pointZoneLength;

    particles.forEach(checkNumberOfParticlesPerGroup);


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

    function checkNumberOfParticlesPerGroup(particle) {
        let yCoord = particle.body.position.y;

        if (yCoord >= threshold) {
            let xCoord = particle.body.position.x;
            let zone = pointZones(xCoord) - 1;

            for (let z = 0; z < groups.length; z++) {
                const isParticleInZone = groups[z].some(p => p.id === particle.id);
                if (isParticleInZone) {
                    return;
                }
            }

            if (groups[zone].full === true) {
                let minZone = groups.reduce((acc, val, index) => val.length < groups[acc].length ? index : acc, 0);
                let zoneMiddle = minZone * zoneWidth + zoneWidth / 2;
                particle.reset(zoneMiddle, 0);
                return;
            }
            if (groups[zone].length + 1 >= maxParticlesPerGroup[0]) {
                groups[zone].full = true;
                maxParticlesPerGroup.shift();
            }
            groups[zone].push(particle);
            particle.body.restitution = 0.9;
        }

    }
}

/**
 * Zach Robinson.
 */
function draw() {
    background(50);
    Engine.update(engine);
    drawPointLabels();
    drawPegs();
    drawParticles();
    drawBoundaries();

    checkParticles();

    const particlesInGroups = groups.reduce((acc, val) => acc + val.length, 0);
    if (particles.length > 0 && particles.length - particlesInGroups === 0) {
        finalizeGroups();
    }



}

function finalizeGroups() {
    noLoop();
    document.querySelector('.defined-groups-wrapper').classList.remove('hidden');
    document.querySelector('#particles-drop').disabled = true;
    const showgroups = new ShowGroups(groups);
    showgroups.show();
}

function startNewDivision() {
    createNewParticles();
    resetGroups();
    console.log(groups);
    maxParticlesPerGroup = maxNumberOfParticlesPerGroup(particles, groups);
    console.log(maxParticlesPerGroup);
}

window['setup'] = setup
window['draw'] = draw
window['preload'] = preload

window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#particles-drop').addEventListener('click', startNewDivision);
    document.querySelector('#particles-reset').addEventListener('click', resetSketch);
});

function maxNumberOfParticlesPerGroup(particles, groups) {
    const totalParticles = particles.length;
    const numGroups = groups.length;
    const baseParticlesPerGroup = Math.floor(totalParticles / numGroups);
    const leftoverParticles = totalParticles % numGroups;

    return groups.map((group, index) => {
        const maxParticles = baseParticlesPerGroup + (index < leftoverParticles ? 1 : 0);
        return maxParticles;
    });


}
