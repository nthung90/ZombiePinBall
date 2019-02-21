import Config from './Config'
var app
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' })
    }

    preload() {
        this.load.image('fire', 'assets/images/fire.png')
        this.load.image('play', 'assets/images/play.png')
    }
    create() {
        app = this
        // this.test()
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

        // let img = this.add.image(0, 0, 'fire').setDisplaySize(55, 55).setOrigin(0.5, 0.5)
        // let attack = this.add.text(-25, 25, "A: 1", {fontFamily: 'Arial',color: '#ffffff',align: 'center',}).setFontSize(18).setOrigin(0.5, 0.5)
        // let health = this.add.text(25, 25, "D: 2", {fontFamily: 'Arial',color: '#ffffff',align: 'center',}).setFontSize(18).setOrigin(0.5, 0.5)
        // let cost = this.add.text(25, -25, "C: 10", {fontFamily: 'Arial',color: '#ffffff',align: 'center',}).setFontSize(18).setOrigin(0.5, 0.5)

        // this.container = this.add.container(200, 200).setSize(55, 55)        
        // this.container.add([img, attack, health, cost])

    }
}
export default MenuScene