var OBSTACLE_SPEED = 350;
var WIDTH = 1200;
var HEIGHT = 800;
var Config = {
    BG_WIDTH: WIDTH,
    BG_HEIGHT: HEIGHT,
    PLAYER_X: WIDTH / 4,
    PLAYER_Y_TOP: 100,
    PLAYER_Y_DOWN: HEIGHT - 100,
    PLAYER_SIZE: 73,
    PLAYER_SCALE: 0.75,
    PLAYER_MAX_SCALE: 1.5,
    GRID_WIDTH: 1500,
    GRID_CELLWIDTH: 64,
    PLAYER_SPEED: 600,
    Firework: {
        x: 400,
        y: 300,
        speed: {
            min: -1600,
            max: 1600
        },
        angle: {
            min: 0,
            max: 360
        },
        scale: {
            start: 3,
            end: 0
        },
        rotate: {
            start: 720,
            end: -720,
            ease: 'Linear'
        },
        blendMode: 'SCREEN',
        lifespan: 2500,
        gravityY: 800,
        maxParticles: 5,
        bounce: 0.3,
        bounds: {
            x: 0,
            y: 0,
            w: WIDTH,
            h: HEIGHT
        }
    },
    obstacles: {
        speed: OBSTACLE_SPEED,
        scale: 0.75,
        spawnMin: 1,
        spawnMax: 3,
        types: [{
                id: "air",
            },
            {
                id: "earth",
            },
            {
                id: "fire",
            },
            {
                id: "life",
            },
            {
                id: "toxic",
            },
            {
                id: "water",
            }
        ]
    },
    items: {
        speed: OBSTACLE_SPEED,
        spawnMin: 1,
        spawnMax: 2,
        spawnTimeout: 5000,
        types: [{
                id: "bat",
            },
            {
                id: "boomstick",
            },
            {
                id: "chainsaw",
            },
            {
                id: "lawnmower",
            },
            {
                id: "nailbomb",
            },
            {
                id: "shovel",
            },
            {
                id: "stapler",
            },
            {
                id: "attack",
            },
            {
                id: "attack",
            },
            {
                id: "attack",
            }
        ]
    }
};
export default Config;