import Config from './Config'
var app
class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MenuScene'
        })
    }
    preload() {
        this.load.image('play', 'assets/images/play.png')
        this.load.image('howtoplay', 'assets/images/HowToPlay.png')
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
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

        // Game title
        // var ting = this.add.text(Config.BG_WIDTH / 2, 50, 'Zombie pin ball', { font: '64px Courier bold', fill: '#4286f4', align: 'center' }).setOrigin(0.5, 0.5)
        var add = this.add
        WebFont.load({
            google: {
                families: ['Freckle Face']
            },
            active: function() {
                add.text(Config.BG_WIDTH / 2, 50, 'Zombie pin ball', {
                    fontFamily: 'Freckle Face',
                    fontSize: 80,
                    color: '#ffffff'
                }).setShadow(2, 2, "#333333", 2, false, true).setOrigin(0.5, 0.5)
            }
        })

        this.add.image(Config.BG_WIDTH / 2, 350, 'howtoplay').setOrigin(0.5, 0.5)

        var playBtn = this.add.image(Config.BG_WIDTH / 2, 700, 'play').setOrigin(0.5, 0.5).setInteractive()
        playBtn.on('pointerdown', () => this.scene.start("GameScene"))
    }
}
export default MenuScene