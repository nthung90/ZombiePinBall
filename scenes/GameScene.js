import Config from './Config'
var app //global variable
class GameScene extends Phaser.Scene {
    init() {
        app = this
        this.getZombieCardsData()
        this.readyToMove = true
        this.playerScale = Config.PLAYER_SCALE
        this.lifePoint = 100
        this.gooPoint = 0
        this.spawnObstacleCount = 0
        this.spawnMin = 0
        this.spawnMax = 0
        this.gooPoint = 0
        this.isGameOver = false
        this.setAirCards = new Set()
        this.setEarthCards = new Set()
        this.setFireCards = new Set()
        this.setLifeCards = new Set()
        this.setToxicCards = new Set()
        this.setWaterCards = new Set()
        this.setItemCards = new Set()
    }
    constructor() {
        super({
            key: 'GameScene',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true,
                    gravity: {
                        y: 0
                    }
                }
            }
        })
    }
    preload() {
        this.load.image('background', 'assets/images/border_background.png')
        this.load.image('air', 'assets/images/air.png')
        this.load.image('earth', 'assets/images/earth.png')
        this.load.image('fire', 'assets/images/fire.png')
        this.load.image('life', 'assets/images/life.png')
        this.load.image('toxic', 'assets/images/toxic.png')
        this.load.image('water', 'assets/images/water.png')
        this.load.image('item', 'assets/images/item.png')
        // firework images
        this.load.image('blue', 'assets/particles/blue_explode.png')
        this.load.image('green', 'assets/particles/green_explode.png')
        this.load.image('orange', 'assets/particles/orange_explode.png')
        this.load.image('pink', 'assets/particles/pink_explode.png')
        this.load.image('purple', 'assets/particles/purple_explode.png')
        this.load.image('red', 'assets/particles/red_explode.png')
        this.load.image('white', 'assets/particles/white_explode.png')
        this.load.image('yellow', 'assets/particles/yellow_explode.png')
        this.load.audio('bg_music', 'assets/sounds/background.mp3')
        this.load.audio('break', 'assets/sounds/break.mp3')
        this.load.audio('touch', 'assets/sounds/touch.mp3')
        this.load.audio('addscore', 'assets/sounds/addscore.mp3')
        this.load.image('restart', 'assets/images/restart.png')
    }
    create() {
        this.showCameraControl()
        this.initBackground()
        this.initPlayer()
        this.initObstacle()
        this.guideTextView = this.add.text(50, 150, 'Tap to move. \nAvoid obstacles. \nKeep moving!', {
            font: '64px Courier bold',
            fill: '#ffffff'
        })
        this.tweens.add({
            targets: this.guideTextView,
            ease: 'Linear',
            alpha: 0,
            duration: 3000,
            repeat: 0,
            yoyo: false
        })
    }
    getZombieCardsData() {
        var request = new XMLHttpRequest()
        request.open('GET', 'https://api.loom.games/zb/v1/cards', true)
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                var data = JSON.parse(request.responseText)
                for (var i = 0; i < data.cards.length; i++) {
                    // console.log("item: " + data.cards[i].set)
                    switch (data.cards[i].set) {
                        case "AIR":
                            app.setAirCards.add(data.cards[i])
                            break;
                        case "EARTH":
                            app.setEarthCards.add(data.cards[i])
                            break;
                        case "FIRE":
                            app.setFireCards.add(data.cards[i])
                            break;
                        case "LIFE":
                            app.setLifeCards.add(data.cards[i])
                            break;
                        case "TOXIC":
                            app.setToxicCards.add(data.cards[i])
                            break;
                        case "WATER":
                            app.setWaterCards.add(data.cards[i])
                            break;
                        case "ITEM":
                            app.setItemCards.add(data.cards[i])
                            break;
                    }
                }
            } else {
                // We reached our target server, but it returned an error
                console.log('We reached our target server, but it returned an error!')
            }
        }
        request.onerror = function() {
            // There was a connection error of some sort
            console.log('There was a connection error of some sort!')
        }
        request.send()
    }
    showCameraControl() {
        if (this.physics.config.debug) {
            this.add.text(0, 0, 'Use Cursors to scroll camera.\nQ / E to zoom in and out', {
                font: '18px Courier',
                fill: '#00ff00'
            })
            var cursors = this.input.keyboard.createCursorKeys()
            var controlConfig = {
                camera: this.cameras.main,
                left: cursors.left,
                right: cursors.right,
                up: cursors.up,
                down: cursors.down,
                zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
                zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
                acceleration: 0.06,
                drag: 0.0005,
                maxSpeed: 1.0
            }
            this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig)
        }
    }
    initBackground() {
        // create rotate grid background
        var grid = this.add.grid(Config.BG_WIDTH / 2, Config.BG_HEIGHT / 2, Config.GRID_WIDTH, Config.GRID_WIDTH, Config.GRID_CELLWIDTH, Config.GRID_CELLWIDTH, 0x141428, 0.5, 0x333333, 1)
        this.tweens.add({
            targets: grid,
            ease: 'Linear',
            angle: 50,
            duration: 10000,
            repeat: -1,
            yoyo: true
        })
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(Config.BG_WIDTH / 2, Config.BG_HEIGHT)
        this.add.image(Config.BG_WIDTH / 2, 0, 'background').setOrigin(0, 0).setDisplaySize(Config.BG_WIDTH / 2, Config.BG_HEIGHT)
        this.lifeTextView = this.add.text(50, 20, 'Life: ' + this.lifePoint, {
            font: '32px Courier bold',
            fill: '#ffffff'
        })
        this.gooTextView = this.add.text(50, 70, 'Goo: 0', {
            font: '32px Courier bold',
            fill: '#ffffff'
        })
        this.bgSound = this.sound.add('bg_music', {
            loop: 'true'
        })
        this.bgSound.play()
    }
    initPlayer() {
        this.player = this.physics.add.image(Config.BG_WIDTH / 4, 100, 'fire').setDisplaySize(Config.PLAYER_SIZE, Config.PLAYER_SIZE)
        this.player.id = 'fire'
        this.player.moveTo = this.plugins.get('rexMoveTo').add(this.player, {
            speed: Config.PLAYER_SPEED,
        }).on('complete', function() {
            app.playerScale = Config.PLAYER_SCALE // reset scale
            app.readyToMove = true
            app.gooPoint++
                app.gooTextView.setText("Goo: " + app.gooPoint)
        })
        this.input.on('pointerdown', () => this.playerMove(this.player.y == Config.PLAYER_Y_TOP))
    }
    initObstacle() {
        this.obstacles = this.add.group()
        this.obstacles.enableBody = true
        this.physics.add.overlap(this.player, this.obstacles, this.playerHitObstacle, null, this)
    }
    playerHitObstacle(player, obstacle) {
        this.destroyObstacle(obstacle)
        if (this.player.id != obstacle.id) {
            this.lifePoint -= 10
            this.lifeTextView.setText('Life: ' + this.lifePoint)
            this.explodeEffect(obstacle, false)
            this.sound.play('break')
        } else {
            console.log("Got the card!")
            this.sound.play('addscore')
        }
        if (this.lifePoint == 0) {
            this.isGameOver = true
            this.bgSound.stop()
            this.player.destroy()
            this.explodeEffect(this.player, true)
            this.showEndScreen()
        }
    }
    destroyObstacle(obj) {
        obj.destroy()
        this.spawnObstacleCount--
    }
    explodeEffect(target, isPlayer) {
        Config.Firework.scale.start = !isPlayer ? 1 : 3
        this.add.particles('blue').createEmitter(Config.Firework).explode(5, target.x, target.y)
        this.add.particles('green').createEmitter(Config.Firework).explode(5, target.x, target.y)
        this.add.particles('orange').createEmitter(Config.Firework).explode(5, target.x, target.y)
        this.add.particles('pink').createEmitter(Config.Firework).explode(5, target.x, target.y)
        this.add.particles('purple').createEmitter(Config.Firework).explode(5, target.x, target.y)
        this.add.particles('red').createEmitter(Config.Firework).explode(5, target.x, target.y)
        this.add.particles('white').createEmitter(Config.Firework).explode(5, target.x, target.y)
        this.add.particles('yellow').createEmitter(Config.Firework).explode(5, target.x, target.y)
    }
    playerMove(isMoveDown) {
        if (this.readyToMove == false) return
        this.readyToMove = false
        this.sound.play('touch')
        this.player.moveTo.moveTo(Config.PLAYER_X / 2, isMoveDown ? Config.PLAYER_Y_DOWN : Config.PLAYER_Y_TOP)
    }
    spawnObstacle(val, speed) {
        var type = Config.obstacles.types[val]
        // Random Obstacle x and y        
        var obstacle = this.physics.add.image(0, 0, type.id)
        var x = Math.random() > 0.5 ? Phaser.Math.FloatBetween(-500, -200) : Phaser.Math.FloatBetween(Config.BG_WIDTH + 200, Config.BG_WIDTH + 500) // random left/right obstacle
        var y = Phaser.Math.FloatBetween(250, Config.BG_HEIGHT - 250)
        obstacle.setScale(Config.obstacles.scale)
        var card = this.randomCard(type.id)

        var damage = this.add.text(-25, 25, "A: " + card.damage, {fontFamily: 'Arial',color: '#ffffff',align: 'center'}).setFontSize(18).setOrigin(0.5, 0.5)
        var health = this.add.text(25, 25, "D: " + card.health, {fontFamily: 'Arial',color: '#ffffff',align: 'center'}).setFontSize(18).setOrigin(0.5, 0.5)
        var cost = this.add.text(25, -25, "C: " + card.cost, {fontFamily: 'Arial',color: '#ffffff',align: 'center'}).setFontSize(18).setOrigin(0.5, 0.5)

        var container = this.add.container(x, y).setSize(55, 55)        
        container.add([obstacle, damage, health, cost])
        container.id = type.id
        container.obstacleDir = x < 0 ? "left" : "right"
        container.body.velocity.x = x < 0 ? speed : -speed

        // Create follow emitter
        var emitter = this.add.particles(type.id).createEmitter({
            speed: 100,
            scale: {
                start: 1,
                end: 0
            },
            blendMode: 'ADD',
            maxParticles: 5,
            lifespan: 500
        })
        emitter.startFollow(container, 0, 0, true)
        this.obstacles.add(container)
    }
    randomCard(type) {
        var card, index, count
        switch (type) {
            case "air":
                index = Phaser.Math.Between(0, this.setAirCards.size - 1)
                count = 0
                for (var entry of this.setAirCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break;
            case "earth":
                index = Phaser.Math.Between(0, this.setEarthCards.size - 1)
                count = 0
                for (var entry of this.setEarthCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break;
            case "fire":
                index = Phaser.Math.Between(0, this.setFireCards.size - 1)
                count = 0
                for (var entry of this.setFireCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break;
            case "life":
                index = Phaser.Math.Between(0, this.setLifeCards.size - 1)
                count = 0
                for (var entry of this.setLifeCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break;
            case "toxic":
                index = Phaser.Math.Between(0, this.setToxicCards.size - 1)
                count = 0
                for (var entry of this.setToxicCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break;
            case "water":
                index = Phaser.Math.Between(0, this.setWaterCards.size - 1)
                count = 0
                for (var entry of this.setWaterCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break;
                // case "item":
                //     index = Phaser.Math.Between(0, this.setItemCards.size - 1)
                //     for(var entry of this.setItemCards.entries()){
                //         if(count++ == index) {
                //             card = entry[0]
                //             break
                //         }
                //     }
                //     break;
        }
        return card
    }
    update(time, delta) {
        // Update camera - debug purpose
        if (this.physics.config.debug) this.controls.update(delta)
        if (!this.isGameOver && this.setAirCards.size > 0) {
            // update Player
            this.updatePlayer()
            // update Obstacle
            this.updateObstacle()
        }
    }
    updatePlayer() {
        // Scale player by time
        // if ((this.player.y == Config.PLAYER_Y_TOP || this.player.y == Config.PLAYER_Y_DOWN) && this.playerScale != -1) {
        //     this.playerScale += 0.0025
        //     this.playerScale = this.playerScale > Config.PLAYER_MAX_SCALE ? Config.PLAYER_MAX_SCALE : this.playerScale
        //     this.player.setScale(this.playerScale)
        // }
        // Destroy player when player is too big
        if (this.playerScale == Config.PLAYER_MAX_SCALE && this.isGameOver == false) {
            //destroy old obstacles
            this.isGameOver = true
            this.player.destroy()
            this.explodeEffect(this.player, true)
            this.sound.play('break')
            this.bgSound.stop()
            this.showEndScreen()
        }
    }
    showEndScreen() {
        this.restartBtn = this.add.image(Config.BG_WIDTH / 2, Config.BG_HEIGHT / 2, 'restart').setOrigin(0.5, 0.5).setInteractive()
        this.restartBtn.on('pointerdown', () => app.scene.restart())
    }
    updateObstacle() {
        if (this.spawnObstacleCount < Config.obstacles.spawnMin) {
            var n = Phaser.Math.Between(Config.obstacles.spawnMin, Config.obstacles.spawnMax)
            for (var i = 0; i < n; i++) {
                var type = Phaser.Math.Between(0, Config.obstacles.types.length - 1)
                this.spawnObstacle(type, Config.obstacles.speed)
                this.spawnObstacleCount++
            }
        }
        if (this.obstacles.children.entries.length > 0) {
            this.obstacles.children.iterate(function(container) {
                // Left obstacle collide right boundary or right obstacle collide left boundary
                var obstacle = container.list[0]
                if (obstacle && ((obstacle.body.x > Config.BG_WIDTH && obstacle.obstacleDir == "left") || (obstacle.body.x < 0 && obstacle.obstacleDir == "right"))) {
                    app.sound.play("break")
                    app.destroyObstacle(container)
                    app.explodeEffect(obstacle, false)
                }
            })
        }
    }
}
export default GameScene