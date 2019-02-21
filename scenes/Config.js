var OBSTACLE_SPEED = 350;
var WIDTH = 1200;
var HEIGHT = 800;
var Config = {
    BG_WIDTH: WIDTH,
    BG_HEIGHT: HEIGHT,
    PLAYER_X: WIDTH / 2,
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
        spawnMin: 2,
        spawnMax: 5,
        types: [{
                id: "air",
                // vx: OBSTACLE_SPEED
            },
            {
                id: "earth",
                // vx: OBSTACLE_SPEED
            },
            {
                id: "fire",
                // vx: OBSTACLE_SPEED
            },
            {
                id: "life",
                // vx: OBSTACLE_SPEED
            },
            {
                id: "toxic",
                // vx: OBSTACLE_SPEED
            },
            {
                id: "water",
                // vx: OBSTACLE_SPEED
            }
        ]
    }
};
export default Config;