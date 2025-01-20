let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

let world;
let particles = [];
let pegs = [];
let boundaries = [];
let particleFrequency = 60;
let columns = Math.round(window.innerWidth / 100);
let rows = 10;

let totalScoreId = "score";

let pointZones = {
    0: 100,
    1: 200,
    2: 300,
    3: 400,
    4: 500,
    5: 400,
    6: 300,
    7: 200,
    8: 100
};

let maxGroups = localStorage.getItem('maxNumber');
if (maxGroups) {
    maxGroups = parseInt(maxGroups, 10);
    pointZones = {};
    for (let i = 0; i < maxGroups; i++) {
        pointZones[i] = (maxGroups - i) * 1;
    }
}


function setWorld(worldIn) {
    world = worldIn;
    return world;
}

const wallHeight = 150;

export { Engine, World, Bodies, world, particles, pegs, boundaries, particleFrequency, columns, rows, totalScoreId, setWorld, pointZones, wallHeight };