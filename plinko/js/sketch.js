import Boundary from './boundary.js';
import Particle from './particle.js';
import Peg from './peg.js';
import { Engine, World, world, particles, pegs, boundaries, particleFrequency, columns, rows, setWorld, pointZones, wallHeight } from './globals.js'
import ShowGroups from './showgroups.js';


class Plinko {
    constructor() {
        this.engine = null;
        this.font = null;
        this.fontSize = 40;
        this.pointZoneLength = Object.keys(pointZones).length;
        this.finalGroups = Array.from({ length: this.pointZoneLength }, () => ({ particles: [], full: false }));
        this.maxParticlesPerGroup = [];
        this.height = window.innerHeight;
        this.threshold = this.height - wallHeight / 2;
        this.zoneWidth = 0;
    }

    preload() {
        this.font = loadFont('assets/OpenSans-Bold.ttf');
    }

    setup() {
        this.engine = Engine.create();
        let world = setWorld(this.engine.world);
        world.gravity.y = 1.5;

        textFont(this.font);
        textSize(this.fontSize);
        textAlign(CENTER, CENTER);

        this.initializeCanvas();
    }

    initializeCanvas() {
        createCanvas(windowWidth, windowHeight);
        let spacing = width / columns;
        this.populatePegs(spacing);
        this.populateCanvasBoundaries();
        let pointZoneSpacing = width / this.pointZoneLength;
        this.populatePointZones(pointZoneSpacing);
    }

    populatePegs(spacing) {
        let radius = windowWidth / 200;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                let x = col * spacing + 12;
                if (row % 2 == 1) x += spacing / 2;
                let y = spacing + row * spacing;
                if (y > height - wallHeight || y < 100) {
                    continue;
                } else {
                    let p = new Peg(x, y, radius);
                    pegs.push(p);
                }
            }
        }
    }

    populatePointZones(spacing) {
        for (let i = 0; i < this.pointZoneLength; i++) {
            let h = wallHeight;
            let w = 5;
            let x = i * spacing - w / 2;
            let y = height - h / 2;
            let wall = new Boundary(x, y, w, h);
            boundaries.push(wall);
        }
    }

    populateCanvasBoundaries() {
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

    resetGroups() {
            this.finalGroups = Array.from({ length: this.pointZoneLength }, () => ({
                particles: [],
                full: false
            }));
            console.log("Groups reset:", this.finalGroups);
        
    }

    createNewParticles() {
        particles.length = 0;
        let names = JSON.parse(localStorage.getItem('names')) || [];
        names.forEach(name => {
            let p = new Particle(windowWidth / 2, 0, 20, name);
            particles.push(p);
        });
        return particles;
    }

    resetSketch() {
        this.removeAllParticles();
        // particles.forEach(particle => World.remove(world, particle.body));
        document.querySelector('.defined-groups-wrapper').classList.add('hidden');
        document.querySelector('#particles-drop').disabled = false;
        this.resetGroups();
    }

    removeAllParticles() {
        for (let i = 0; i < particles.length; i++) World.remove(world, particles[i].body);
        particles.splice(0, particles.length);
    }

    removeParticle(counter) {
        World.remove(world, particles[counter].body);
        particles.splice(counter, 1);
    }

    drawParticles() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].show();
            if (particles[i].isOffScreen()) this.removeParticle(i--);
        }
    }

    drawPegs() {
        for (let i = 0; i < pegs.length; i++) {
            pegs[i].show();
        }
    }

    drawBoundaries() {
        for (let i = 0; i < boundaries.length; i++) {
            boundaries[i].show();
        }
    }

    drawPointLabels() {
        let point = 1;
        let delta = 1;
        let length = this.pointZoneLength;
        let yCoord = height - 50;
        let zoneWidth = width / length;
        let offset = zoneWidth / 2 - 2;

        for (let i = 0; i < length; i++) {
            let xCoord = zoneWidth * i + offset;
            this.drawLabel(point.toString(), xCoord, yCoord);
            point += delta;
        }
    }

    drawLabel(value, x, y) {
        fill(185);
        stroke(185);
        text(value, x, y);
    }

    checkParticles() {
        if (particles.length === 0) {
            return;
        }
        this.zoneWidth = width / this.pointZoneLength;

        particles.forEach(this.checkNumberOfParticlesPerGroup.bind(this));
    }

    pointZones(xCoord) {
        let point = 1;
        let delta = 1;
        let length = this.pointZoneLength;
        let zoneWidth = width / length;
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

    checkNumberOfParticlesPerGroup(particle) {
        let yCoord = particle.body.position.y;
        let length = this.pointZoneLength;
        let zoneWidth = width / length;
        if (yCoord >= this.threshold) {
            let xCoord = particle.body.position.x;
            let zone = this.pointZones(xCoord) - 1;

            for (let z = 0; z < this.finalGroups.length; z++) {
                const isParticleInZone = this.finalGroups[z].particles.some(p => p.id === particle.id);
                if (isParticleInZone) {
                    return;
                }
            }

            if (this.finalGroups[zone].full === true) {
                let minZone = this.finalGroups.reduce((acc, val, index) => val.particles.length < this.finalGroups[acc].particles.length ? index : acc, 0);
                let zoneMiddle = minZone * zoneWidth + zoneWidth / 2;
                particle.reset(zoneMiddle, 0);
                return;
            }
            if (this.finalGroups[zone].particles.length + 1 >= this.maxParticlesPerGroup[0]) {
                this.finalGroups[zone].full = true;
                this.maxParticlesPerGroup.shift();
            }
            this.finalGroups[zone].particles.push(particle);
            particle.body.restitution = 0.7;
        }
    }

    draw() {
        background(50);
        Engine.update(this.engine);
        this.drawPointLabels();
        this.drawPegs();
        this.drawParticles();
        this.drawBoundaries();
        this.checkParticles();

        const particlesInGroups = this.finalGroups.reduce((acc, val) => acc + val.particles.length, 0);
        if (particles.length > 0 && particles.length - particlesInGroups === 0) {
            this.finalizeGroups();
        }
    }

    finalizeGroups() {
        // noLoop();
        document.querySelector('.defined-groups-wrapper').classList.remove('hidden');
        document.querySelector('#particles-drop').disabled = true;
        const showgroups = new ShowGroups(this.finalGroups);
        showgroups.show();
    }

    startNewDivision() {
        // this.removeAllParticles();
        this.resetGroups();
        this.createNewParticles();
        this.maxParticlesPerGroup = this.maxNumberOfParticlesPerGroup(particles, this.finalGroups);
        loop();
    }

    maxNumberOfParticlesPerGroup(particles, groups) {
        const totalParticles = particles.length;
        const numGroups = groups.length;
        const baseParticlesPerGroup = Math.floor(totalParticles / numGroups);
        const leftoverParticles = totalParticles % numGroups;

        return groups.map((group, index) => {
            const maxParticles = baseParticlesPerGroup + (index < leftoverParticles ? 1 : 0);
            return maxParticles;
        });
    }
}

const plinko = new Plinko();

window['setup'] = plinko.setup.bind(plinko);
window['draw'] = plinko.draw.bind(plinko);
window['preload'] = plinko.preload.bind(plinko);

// window.addEventListener('resize', () => {
//     plinko.height = window.innerHeight;
//     plinko.threshold = plinko.height - wallHeight / 2;
//     resizeCanvas(windowWidth, windowHeight);
// });

window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#particles-drop').addEventListener('click', plinko.startNewDivision.bind(plinko));
    document.querySelector('#particles-reset').addEventListener('click', plinko.resetSketch.bind(plinko));
});
