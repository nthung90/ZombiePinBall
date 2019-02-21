import 'phaser';
import MoveToPlugin from '../plugins/moveto-plugin.js';
import Config from '../scenes/Config';
import GameScene from '../scenes/GameScene';
import MenuScene from '../scenes/MenuScene';

let config = {
    type: Phaser.AUTO,
    width: Config.BG_WIDTH,
    height: Config.BG_HEIGHT,
    scene: [MenuScene, GameScene],
    plugins: {
        global: [{
            key: 'rexMoveTo',
            plugin: MoveToPlugin,
            start: true
        }]
    }
};

let game = new Phaser.Game(config);
