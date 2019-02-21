import Config from './Config'
var app
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' })
    }

    preload() {
        this.load.image('play', 'assets/images/play.png')
    }
    create() {
        app = this
        // create rotate background
        this.grid = this.add.grid(Config.BG_WIDTH / 2, Config.BG_HEIGHT / 2, Config.GRID_WIDTH, Config.GRID_WIDTH, Config.GRID_CELLWIDTH, Config.GRID_CELLWIDTH, 0x141428, 0.5, 0x333333, 1)
        this.tweens.add({
            targets: this.grid,
            ease: 'Linear',
            angle: 50,
            duration: 10000,
            repeat: -1,
            yoyo: true
        })
        var ting = this.add.text(Config.BG_WIDTH / 2, 200, 'TING', { font: '128px Courier bold', fill: '#4286f4', align: 'center' }).setOrigin(0.5, 0.5)

        var playBtn = this.add.image(Config.BG_WIDTH / 2, Config.BG_HEIGHT / 2, 'play').setOrigin(0.5, 0.5).setInteractive()
        playBtn.on('pointerdown', () => this.scene.start("GameScene"))
    }
}
export default MenuScene