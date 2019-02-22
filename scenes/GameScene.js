import Config from './Config'
var app //global variable
class GameScene extends Phaser.Scene {
    init() {
        app = this
        this.getZombieCardsData()
        this.readyToMove = true
        this.playerScale = Config.PLAYER_SCALE
        this.playerLifePoint = 100
        this.playerGooPoint = 0
        this.playerAttack = 0
        this.playerDefense = 0
        this.spawnObstacleCount = 0
        this.spawnMin = 0
        this.spawnMax = 0
        this.isGameOver = false
        this.setAirCards = new Set()
        this.setEarthCards = new Set()
        this.setFireCards = new Set()
        this.setLifeCards = new Set()
        this.setToxicCards = new Set()
        this.setWaterCards = new Set()
        
        this.timer

        this.opponentLifePoint = 100
        this.opponentGooPoint = 0
        this.opponentAttack = 0
        this.opponentDefense = 0
    }

    constructor() {
        super({
            key: 'GameScene',
            physics: {
                default: 'arcade',
                arcade: {
                    // debug: true,
                    gravity: {
                        y: 0
                    }
                }
            }
        })
    }

    preload() {
        this.load.image('background', 'assets/images/border_background.png')
        //player + obstacle
        this.load.image('air', 'assets/images/air.png')
        this.load.image('earth', 'assets/images/earth.png')
        this.load.image('fire', 'assets/images/fire.png')
        this.load.image('life', 'assets/images/life.png')
        this.load.image('toxic', 'assets/images/toxic.png')
        this.load.image('water', 'assets/images/water.png')

        //item
        this.load.image('item', 'assets/images/item.png')
        this.load.image('bat', 'assets/images/bat.png')
        this.load.image('boomstick', 'assets/images/boomstick.png')
        this.load.image('chainsaw', 'assets/images/chainsaw.png')
        this.load.image('corruptedgoo', 'assets/images/corruptedgoo.png')
        this.load.image('lawnmower', 'assets/images/lawnmower.png')
        this.load.image('nailbomb', 'assets/images/nailbomb.png')
        this.load.image('shovel', 'assets/images/shovel.png')
        this.load.image('stapler', 'assets/images/stapler.png')
        this.load.image('taintedgoo', 'assets/images/taintedgoo.png')
        this.load.image('attack', 'assets/images/attack.png')
        this.load.atlas('flares', 'assets/images/flares.png', 'assets/images/flares.json');
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
        this.initItem()

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
        var style = { font: '24px Courier bold', fill: '#ffffff' }

        // player's text view
        this.playerLifeTextView = this.add.text(50, 20, 'Life: ' + this.playerLifePoint, style)
        this.playerGooTextView = this.add.text(50, 70, 'Goo: 0', style)
        this.playerAttackTextView = this.add.text(370, 20, 'Attack: 0', style)
        this.playerDefenseTextView = this.add.text(370, 70, 'Defense: 0', style)

        // opponent text view
        this.opponentLifeTextView = this.add.text(650, 20, 'Life: ' + this.opponentLifePoint, style)
        this.opponentGooTextView = this.add.text(650, 70, 'Goo: ' , style)
        this.opponentAttackTextView = this.add.text(970, 20, 'Attack: 0', style)
        this.opponentDefenseTextView = this.add.text(970, 70, 'Defense: 0', style)

        this.bgSound = this.sound.add('bg_music', { loop: 'true' })
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
            app.playerGooPoint++
            app.playerGooTextView.setText("Goo: " + app.playerGooPoint)
        })
        this.input.on('pointerdown', () => this.playerMove(this.player.y == Config.PLAYER_Y_TOP))
    }

    initObstacle() {
        this.obstacles = this.add.group()
        this.obstacles.enableBody = true
        this.physics.add.overlap(this.player, this.obstacles, this.playerHitObstacle, null, this)
    }

    initItem() {
        this.items = this.add.group()
        this.items.enableBody = true
        this.physics.add.overlap(this.player, this.items, this.playerHitItem, null, this)
        this.timer = this.time.addEvent({
            delay: Config.items.spawnTimeout, // ms
            callback: this.timerItemCallback,
            loop: true
        });
    }

    timerItemCallback() {
        var n = Phaser.Math.Between(Config.items.spawnMin, Config.items.spawnMax)
        for (var i = 0; i < n; i++) {
            var type = Phaser.Math.Between(0, Config.items.types.length - 1)
            // app.spawnItem(type, Config.items.speed)
            app.spawnItem(9, Config.items.speed) // hungnt Test
        }
    }

    playerHitObstacle(player, container) {
        this.destroyObstacle(container)
        if (this.player.id != container.id) {
            this.playerLifePoint -= 10
            this.playerLifeTextView.setText('Life: ' + this.playerLifePoint)
            this.explodeEffect(container, false)
            this.sound.play('break')
        } else {
            console.log("Got the card!")
            this.playerAttack += container.damage
            this.playerAttackTextView.setText("Attack: " + this.playerAttack)
            this.playerDefense += container.health
            this.playerDefenseTextView.setText("Defense: " + this.playerDefense)
            this.sound.play('addscore')
        }
        if (this.playerLifePoint == 0) {
            this.isGameOver = true
            this.bgSound.stop()
            this.player.destroy()
            this.explodeEffect(this.player, true)
            this.showEndScreen()
        }
    }

    playerHitItem(player, item) {
        item.destroy()
        console.log("got the item " + item.id)
        this.attackParticle(item)
    }

    attackParticle(item){
        var path = new Phaser.Curves.Path(this.player.x, this.player.y).lineTo(Config.BG_WIDTH *  0.75, Config.BG_HEIGHT / 2)
        var particles = this.add.particles('flares')
        var attEmitter = particles.createEmitter({
            frame: { frames: [ 'red', 'green', 'blue' ], cycle: true },
            scale: { start: 0.5, end: 0 },
            lifespan: 700,
            blendMode: 'ADD',
            emitZone: { type: 'edge', source: path, quantity: 48, yoyo: false }
        })
        this.time.delayedCall(700, function(){
            attEmitter.on = false
            this.add.particles('blue').createEmitter(Config.Firework).explode(5, Config.BG_WIDTH *  0.75, Config.BG_HEIGHT / 2)
            this.attackParticleCallback(item)
        }, [], this)
    }

    attackParticleCallback(item){
        switch(item.id){
            case "bat":
                
            break
            // case "boomstick":
            //     // deal damage to opponent
            // break;
            // case "chainsaw":
            // break;
            // case "corruptedgoo":
            // break;
            // case "lawnmower":
            // break;
            // case "nailbomb":
            // break;
            // case "shovel":
            // break;
            // case "stapler":
            // break;
            // case "taintedgoo":
            // break;
            case "attack":
                this.opponentDefense = this.playerAttack - this.opponentDefense
                if(this.opponentDefense < 0){
                    this.opponentLifePoint += this.opponentDefense
                    this.opponentDefense = 0
                }
                this.playerAttack = 0
                this.updatePlayerTextView()
                this.updateOpponentTextView()
            break
        }
    }

    updatePlayerTextView(){
        this.playerLifeTextView.setText('Life: ' + this.playerLifePoint)
        this.playerGooTextView.setText('Goo: ' + this.playerGooPoint)
        this.playerAttackTextView.setText('Attack: ' + this.playerAttack)
        this.playerDefenseTextView.setText('Defense: ' + this.playerDefense)
    }

    updateOpponentTextView(){
        this.opponentLifeTextView.setText('Life: ' + this.opponentLifePoint)
        this.opponentGooTextView.setText('Goo: ' + this.opponentGooPoint)
        this.opponentAttackTextView.setText('Attack: ' + this.opponentAttack)
        this.opponentDefenseTextView.setText('Defense: ' + this.opponentDefense)
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

        var damage = this.add.text(-25, 25, "A: " + card.damage, { fontFamily: 'Arial', color: '#ffffff', align: 'center' }).setFontSize(18).setOrigin(0.5, 0.5)
        var cost = this.add.text(25, 25, "D: " + card.health, { fontFamily: 'Arial', color: '#ffffff', align: 'center' }).setFontSize(18).setOrigin(0.5, 0.5)
        var health = this.add.text(25, -25, "C: " + card.cost, { fontFamily: 'Arial', color: '#ffffff', align: 'center' }).setFontSize(18).setOrigin(0.5, 0.5)

        var container = this.add.container(x, y).setSize(55, 55)
        container.add([obstacle, damage, health, cost])
        container.id = type.id
        container.damage = card.damage
        container.health = card.health
        container.cost = card.cost

        container.obstacleDir = x < 0 ? "left" : "right"
        this.physics.world.enable(container)
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

    spawnItem(val, speed) {
        var type = Config.items.types[val]
        // Random item x and y        
        var item = this.physics.add.image(0, 0, type.id)
        item.x = Math.random() > 0.5 ? Phaser.Math.FloatBetween(-500, -200) : Phaser.Math.FloatBetween(Config.BG_WIDTH + 200, Config.BG_WIDTH + 500) // random left/right item
        item.y = Phaser.Math.FloatBetween(250, Config.BG_HEIGHT - 250)
        item.id = type.id

        item.itemDir = item.x < 0 ? "left" : "right"
        item.body.velocity.x = item.x < 0 ? speed : -speed
        this.items.add(item)
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
            // update Item
            this.updateItem()
        }
    }

    updatePlayer() {
        // Scale player by time
        if ((this.player.y == Config.PLAYER_Y_TOP || this.player.y == Config.PLAYER_Y_DOWN) && this.playerScale != -1) {
            this.playerScale += 0.005
            this.playerScale = this.playerScale > Config.PLAYER_MAX_SCALE ? Config.PLAYER_MAX_SCALE : this.playerScale
            this.player.setScale(this.playerScale)
        }
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
            this.obstacles.children.iterate(function(obstacle) {
                // Left obstacle collide right boundary or right obstacle collide left boundary
                if (obstacle && ((obstacle.body.x > Config.BG_WIDTH && obstacle.obstacleDir == "left") || (obstacle.body.x < 0 && obstacle.obstacleDir == "right"))) {
                    app.sound.play("break")
                    app.destroyObstacle(obstacle)
                    app.explodeEffect(obstacle, false)
                }
            })
        }
    }

    updateItem() {
        if (this.items.children.entries.length > 0) {
            this.items.children.iterate(function(item) {
                // Left item collide right boundary or right item collide left boundary
                if (item && ((item.body.x > Config.BG_WIDTH && item.itemDir == "left") || (item.body.x < 0 && item.itemDir == "right"))) {
                    item.destroy()
                }
            })
        }
    }
}
export default GameScene