import Config from './Config'
var app //global variable
class GameScene extends Phaser.Scene {
    init() {
        app = this
        this.getZombieCardsData()
        this.player
        this.opponent
        //obstacles
        this.spawnObstacleCount = 0
        this.spawnMin = 0
        this.spawnMax = 0
        //set cards
        this.setAirCards = new Set()
        this.setEarthCards = new Set()
        this.setFireCards = new Set()
        this.setLifeCards = new Set()
        this.setToxicCards = new Set()
        this.setWaterCards = new Set()
        this.isGameOver = false
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
        this.load.image('lawnmower', 'assets/images/lawnmower.png')
        this.load.image('nailbomb', 'assets/images/nailbomb.png')
        this.load.image('shovel', 'assets/images/shovel.png')
        this.load.image('stapler', 'assets/images/stapler.png')
        this.load.image('attack', 'assets/images/attack.png')
        this.load.atlas('flares', 'assets/images/flares.png', 'assets/images/flares.json')
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
        // init Player and Opponent
        var index = Phaser.Math.Between(0, Config.obstacles.types.length - 1)
        this.player = this.physics.add.image(Config.BG_WIDTH / 4, 100, Config.obstacles.types[index].id).setDisplaySize(Config.PLAYER_SIZE, Config.PLAYER_SIZE)
        this.player.name = "player"
        this.initObject(this.player, index)
        index = Phaser.Math.Between(0, Config.obstacles.types.length - 1)
        this.opponent = this.physics.add.image(Config.BG_WIDTH * 0.75, 100, Config.obstacles.types[index].id).setDisplaySize(Config.PLAYER_SIZE, Config.PLAYER_SIZE)
        this.opponent.name = "opponent"
        this.initObject(this.opponent, index)
        this.updatePlayerTextView()
        this.updateOpponentTextView()
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
        this.input.on('pointerdown', () => this.playerMove(this.player.y == Config.PLAYER_Y_TOP))
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
                            break
                        case "EARTH":
                            app.setEarthCards.add(data.cards[i])
                            break
                        case "FIRE":
                            app.setFireCards.add(data.cards[i])
                            break
                        case "LIFE":
                            app.setLifeCards.add(data.cards[i])
                            break
                        case "TOXIC":
                            app.setToxicCards.add(data.cards[i])
                            break
                        case "WATER":
                            app.setWaterCards.add(data.cards[i])
                            break
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
        var style = {
            font: '24px Courier bold',
            fill: '#ffffff'
        }
        // player's text view
        this.playerLifeTextView = this.add.text(50, 20, 'Life: 0', style)
        this.playerAttackTextView = this.add.text(370, 20, 'Attack: 0', style)
        this.playerDefenseTextView = this.add.text(370, 70, 'Defense: 0', style)
        // opponent text view
        this.opponentLifeTextView = this.add.text(650, 20, 'Life: 0', style)
        this.opponentAttackTextView = this.add.text(970, 20, 'Attack: 0', style)
        this.opponentDefenseTextView = this.add.text(970, 70, 'Defense: 0', style)
        this.bgSound = this.sound.add('bg_music', {
            loop: 'true'
        })
        this.bgSound.play()
    }
    initObject(object, index) {
        object.id = Config.obstacles.types[index].id
        object.index = index
        object.Scale = Config.PLAYER_SCALE
        object.ReadyToMove = true
        object.LifePoint = 20
        object.Attack = 0
        object.Defense = 0
        object.moveTo = this.plugins.get('rexMoveTo').add(object, {
            speed: Config.PLAYER_SPEED,
            // speed: Config.obstacles.speed,
        }).on('complete', function() {
            object.Scale = Config.PLAYER_SCALE // reset scale
            object.ReadyToMove = true
        })
    }
    initObstacle() {
        this.obstacles = this.add.group()
        this.obstacles.enableBody = true
        this.physics.add.overlap(this.player, this.obstacles, this.objectHitObstacle, null, this)
        this.physics.add.overlap(this.opponent, this.obstacles, this.objectHitObstacle, null, this)
    }
    initItem() {
        this.items = this.add.group()
        this.items.enableBody = true
        this.physics.add.overlap(this.player, this.items, this.objectHitItem, null, this)
        this.physics.add.overlap(this.opponent, this.items, this.objectHitItem, null, this)
        this.time.addEvent({
            delay: Config.items.spawnTimeout, // ms
            callback: this.timerItemCallback,
            loop: true
        })
    }
    timerItemCallback() {
        var n = Phaser.Math.Between(Config.items.spawnMin, Config.items.spawnMax)
        for (var i = 0; i < n; i++) app.spawnItem(Phaser.Math.Between(0, Config.items.types.length - 1), Config.items.speed)
    }
    objectHitObstacle(object, container) {
        this.destroyObstacle(container)
        if (object.id != container.id) {
            object.Defense -= container.damage
            if (object.Defense < 0) {
                object.LifePoint += object.Defense
                if (object.LifePoint < 0) object.LifePoint = 0
                object.Defense = 0
            }
            if (object.name == "player") {
                this.updatePlayerTextView()
                this.sound.play('break')
            } else this.updateOpponentTextView()
            this.explodeEffect(container, false)
        } else {
            // console.log("Got the card!")
            object.Attack += container.damage
            object.Defense += container.health
            if (object.name == "player") {
                this.updatePlayerTextView()
                this.sound.play('addscore')
            } else this.updateOpponentTextView()
        }
    }
    objectHitItem(object, item) {
        item.destroy()
        // console.log("got the item " + item.id)
        var msg
        switch (item.id) {
            case "bat":
                msg = "Deal 3 damage to opponent"
                this.attackParticle(object, item)
                break
            case "boomstick":
                msg = "Deal 2 damage to opponent"
                this.attackParticle(object, item)
                break
            case "chainsaw":
                msg = "Add 7 damage to player"
                if (object.name == "player") this.updateStats("player", "attack", 7)
                else this.updateStats("opponent", "attack", 7)
                break
            case "lawnmower":
                msg = "Deal 2 damage to opponent"
                this.attackParticle(object, item)
                break
            case "nailbomb":
                msg = "Deal 5 damage to opponent"
                this.attackParticle(object, item)
                break
            case "shovel":
                msg = "Add 3 defense to player"
                if (object.name == "player") this.updateStats("player", "defense", 3)
                else this.updateStats("opponent", "defense", 3)
                break
            case "stapler":
                msg = "Add 4 defense to player"
                if (object.name == "player") this.updateStats("player", "defense", 4)
                else this.updateStats("opponent", "defense", 4)
                break
            case "attack":
                msg = "Attack!"
                this.attackParticle(object, item)
                break
        }
        if (object.name == "player") this.createSpeechBubble(Config.BG_WIDTH / 4 + 25, 730, 250, 50, msg)
        else this.createSpeechBubble(Config.BG_WIDTH * 0.75 + 25, 730, 250, 50, msg)
    }
    attackParticle(object, item) {
        var path
        if (object.name == "player") path = new Phaser.Curves.Path(object.x, object.y).lineTo(Config.BG_WIDTH * 0.75, Config.BG_HEIGHT / 2)
        else path = new Phaser.Curves.Path(object.x, object.y).lineTo(Config.BG_WIDTH / 4, Config.BG_HEIGHT / 2)
        var particles = this.add.particles('flares')
        var attEmitter = particles.createEmitter({
            frame: {
                frames: ['red', 'green', 'blue'],
                cycle: true
            },
            scale: {
                start: 0.5,
                end: 0
            },
            lifespan: 700,
            blendMode: 'ADD',
            emitZone: {
                type: 'edge',
                source: path,
                quantity: 48,
                yoyo: false
            }
        })
        this.time.delayedCall(700, function() {
            attEmitter.on = false
            this.add.particles('blue').createEmitter(Config.Firework).explode(5, Config.BG_WIDTH * 0.75, Config.BG_HEIGHT / 2)
            this.attackParticleCallback(object, item)
        }, [], this)
    }
    attackParticleCallback(object, item) {
        switch (item.id) {
            case "bat":
                // Deal 3 damage to opponent
                if (object.name == "player") this.updateStats("opponent", "defense", -3)
                else this.updateStats("player", "defense", -3)
                break
            case "boomstick":
                // Deal 2 damage to opponent
                if (object.name == "player") this.updateStats("opponent", "defense", -2)
                else this.updateStats("player", "defense", -2)
                break
            case "lawnmower":
                // Deal 2 damage to opponent
                if (object.name == "player") this.updateStats("opponent", "defense", -2)
                else this.updateStats("player", "defense", -2)
                break
            case "nailbomb":
                // Deal 5 damage to opponent
                if (object.name == "player") this.updateStats("opponent", "defense", -5)
                else this.updateStats("player", "defense", -5)
                break
            case "attack":
                if (object.name == "player") {
                    this.updateStats("opponent", "defense", -this.player.Attack)
                    this.player.Attack = 0
                    this.updatePlayerTextView()
                } else {
                    this.updateStats("player", "defense", -this.opponent.Attack)
                    this.opponent.Attack = 0
                    this.updateOpponentTextView()
                }
                break
        }
    }
    createSpeechBubble(x, y, width, height, quote) {
        var bubbleWidth = width;
        var bubbleHeight = height;
        var bubblePadding = 10;
        var arrowHeight = bubbleHeight / 4;
        var bubble = this.add.graphics({
            x: x,
            y: y
        });
        //  Bubble shadow
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);
        //  Bubble color
        bubble.fillStyle(0xffffff, 1);
        //  Bubble outline line style
        bubble.lineStyle(4, 0x565656, 1);
        //  Bubble shape and outline
        bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
        //  Calculate arrow coordinates
        var point1X = Math.floor(bubbleWidth / 7);
        var point1Y = bubbleHeight;
        var point2X = Math.floor((bubbleWidth / 7) * 2);
        var point2Y = bubbleHeight;
        var point3X = Math.floor(bubbleWidth / 7);
        var point3Y = Math.floor(bubbleHeight + arrowHeight);
        //  Bubble arrow shadow
        bubble.lineStyle(4, 0x222222, 0.5);
        bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);
        //  Bubble arrow fill
        bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
        bubble.lineStyle(2, 0x565656, 1);
        bubble.lineBetween(point2X, point2Y, point3X, point3Y);
        bubble.lineBetween(point1X, point1Y, point3X, point3Y);
        var content = this.add.text(0, 0, quote, {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#000000',
            align: 'center',
            wordWrap: {
                width: bubbleWidth - (bubblePadding * 2)
            }
        });
        var b = content.getBounds();
        content.setPosition(bubble.x + (bubbleWidth / 2) - (b.width / 2), bubble.y + (bubbleHeight / 2) - (b.height / 2));
        this.time.delayedCall(3000, function() {
            content.destroy()
            bubble.clear()
        }, [], this)
    }
    updateStats(object, type, number) {
        if (object == "opponent") {
            if (type == "attack") this.opponent.Attack += number
            if (type == "defense") {
                this.opponent.Defense += number
                if (this.opponent.Defense < 0) {
                    this.opponent.LifePoint += this.opponent.Defense
                    if (this.opponent.LifePoint < 0) this.opponent.LifePoint = 0
                    this.opponent.Defense = 0
                }
            }
            this.updateOpponentTextView()
        }
        if (object == "player") {
            if (type == "attack") this.player.Attack += number
            if (type == "defense") {
                this.player.Defense += number
                if (this.player.Defense < 0) {
                    this.player.LifePoint += this.player.Defense
                    if (this.player.LifePoint < 0) this.player.LifePoint = 0
                    this.player.Defense = 0
                }
            }
            this.updatePlayerTextView()
        }
    }
    updatePlayerTextView() {
        this.playerLifeTextView.setText('Life: ' + this.player.LifePoint)
        this.playerAttackTextView.setText('Attack: ' + this.player.Attack)
        this.playerDefenseTextView.setText('Defense: ' + this.player.Defense)
    }
    updateOpponentTextView() {
        this.opponentLifeTextView.setText('Life: ' + this.opponent.LifePoint)
        this.opponentAttackTextView.setText('Attack: ' + this.opponent.Attack)
        this.opponentDefenseTextView.setText('Defense: ' + this.opponent.Defense)
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
        if (this.player.ReadyToMove == false) return
        this.player.ReadyToMove = false
        this.sound.play('touch')
        this.player.moveTo.moveTo(Config.PLAYER_X, isMoveDown ? Config.PLAYER_Y_DOWN : Config.PLAYER_Y_TOP)
    }
    opponentMove(isMoveDown) {
        if (this.opponent.ReadyToMove == false) return
        this.opponent.ReadyToMove = false
        this.opponent.moveTo.moveTo(Config.PLAYER_X * 3, isMoveDown ? Config.PLAYER_Y_DOWN : Config.PLAYER_Y_TOP)
    }
    spawnObstacle(val, speed) {
        var type = Config.obstacles.types[val]
        // Random Obstacle x and y        
        var obstacle = this.physics.add.image(0, 0, type.id)
        var x = Math.random() > 0.5 ? Phaser.Math.FloatBetween(-500, -200) : Phaser.Math.FloatBetween(Config.BG_WIDTH + 200, Config.BG_WIDTH + 500) // random left/right obstacle
        var y = Phaser.Math.FloatBetween(250, Config.BG_HEIGHT - 250)
        obstacle.setScale(Config.obstacles.scale)
        var card = this.randomCard(type.id)
        var damage = this.add.text(-25, 25, "A: " + card.damage, {
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        }).setFontSize(18).setOrigin(0.5, 0.5)
        var health = this.add.text(25, 25, "D: " + card.health, {
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        }).setFontSize(18).setOrigin(0.5, 0.5)
        var container = this.add.container(x, y).setSize(55, 55)
        container.add([obstacle, damage, health])
        container.id = type.id
        container.damage = card.damage
        container.health = card.health
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
        count = 0
        switch (type) {
            case "air":
                index = Phaser.Math.Between(0, this.setAirCards.size - 1)
                for (var entry of this.setAirCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break
            case "earth":
                index = Phaser.Math.Between(0, this.setEarthCards.size - 1)
                for (var entry of this.setEarthCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break
            case "fire":
                index = Phaser.Math.Between(0, this.setFireCards.size - 1)
                for (var entry of this.setFireCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break
            case "life":
                index = Phaser.Math.Between(0, this.setLifeCards.size - 1)
                for (var entry of this.setLifeCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break
            case "toxic":
                index = Phaser.Math.Between(0, this.setToxicCards.size - 1)
                for (var entry of this.setToxicCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break
            case "water":
                index = Phaser.Math.Between(0, this.setWaterCards.size - 1)
                for (var entry of this.setWaterCards.entries()) {
                    if (count++ == index) {
                        card = entry[0]
                        break
                    }
                }
                break
        }
        return card
    }
    update(time, delta) {
        // Update camera - debug purpose
        if (this.physics.config.debug) this.controls.update(delta)
        // Start game after got data from server
        if (!this.isGameOver && this.setAirCards.size > 0) {
            this.updateObject(this.player)
            this.updateObject(this.opponent)
            this.updateopponentAutoMove()
            this.updateObstacle()
            this.updateItem()
        }
    }
    updateopponentAutoMove() {
        if(!this.opponent.ReadyToMove)  return
        if (this.opponent.Scale >= Config.PLAYER_MAX_SCALE - 0.1) {
            this.opponentMove(this.opponent.y == Config.PLAYER_Y_TOP)
            return
        }
        var isOpponentOkToMove = true
        if (this.obstacles.children.entries.length > 0) {
            this.obstacles.children.iterate(function(obstacle) {
                // easy mode
                // if (obstacle && obstacle.id != app.opponent.id && ((obstacle.obstacleDir == "left" && obstacle.body.x > Config.BG_WIDTH * 0.75) || (obstacle.obstacleDir == "right" && obstacle.body.x <= Config.BG_WIDTH * 0.75))) isOpponentOkToMove = true
                // else isOpponentOkToMove = false
                // hard mode
                if (obstacle && obstacle.id != app.opponent.id) {
                    var distance, distance_min, distance_max
                    var distance = Phaser.Math.Difference(obstacle.body.y, app.opponent.y)
                    if (obstacle.obstacleDir == "left") {
                        // distance_max = (Config.BG_WIDTH * 0.75 - distance) + (Config.PLAYER_SIZE * app.opponent.Scale)
                        // distance_min = (Config.BG_WIDTH * 0.75 - distance) - (Config.PLAYER_SIZE * app.opponent.Scale)
                        distance_max = (Config.BG_WIDTH * 0.75 - distance) + 200 // 200 is magic number
                        distance_min = (Config.BG_WIDTH * 0.75 - distance) - 200
                    }
                    if (obstacle.obstacleDir == "right") {
                        distance_max = (Config.BG_WIDTH * 0.75 + distance) + 200
                        distance_min = (Config.BG_WIDTH * 0.75 + distance) - 200
                    }
                    if (obstacle.body.x >= distance_min && obstacle.body.x <= distance_max) isOpponentOkToMove = false
                }
            })
        }
        if (isOpponentOkToMove) this.opponentMove(this.opponent.y == Config.PLAYER_Y_TOP)
    }
    updateObject(object) {
        // Scale player by time
        if ((object.y == Config.PLAYER_Y_TOP || object.y == Config.PLAYER_Y_DOWN) && object.Scale != -1) {
            object.Scale += 0.005
            object.Scale = object.Scale > Config.PLAYER_MAX_SCALE ? Config.PLAYER_MAX_SCALE : object.Scale
            object.setScale(object.Scale)
        }
        // Destroy object when object is too big or LifePoint equal 0
        if ((object.LifePoint <= 0 || object.Scale == Config.PLAYER_MAX_SCALE) && this.isGameOver == false) {
            // Destroy old obstacles
            object.destroy()
            this.explodeEffect(object, true)
            this.sound.play('break')
            this.bgSound.stop()
            this.showEndScreen()
        }
    }
    updateObstacle() {
        if (this.spawnObstacleCount < Config.obstacles.spawnMin) {
            var n = Phaser.Math.Between(Config.obstacles.spawnMin, Config.obstacles.spawnMax)
            for (var i = 0; i < n; i++) {
                var type = Phaser.Math.Between(0, Config.obstacles.types.length - 1)
                this.spawnObstacle(type, Config.obstacles.speed)
                this.spawnObstacleCount++
            }
            this.spawnObstacle(this.player.index, Config.obstacles.speed)
            this.spawnObstacleCount++
            this.spawnObstacle(this.opponent.index, Config.obstacles.speed)
            this.spawnObstacleCount++
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
                if (item && ((item.body.x > Config.BG_WIDTH && item.itemDir == "left") || (item.body.x < 0 && item.itemDir == "right"))) item.destroy()
            })
        }
    }
    showEndScreen() {
        this.isGameOver = true
        if (this.player.LifePoint > 0) this.add.text(Config.BG_WIDTH / 2, 150, 'You Win!', {
            font: '64px Courier bold',
            fill: '#ffffff',
        }).setOrigin(0.5, 0.5)
        else this.add.text(Config.BG_WIDTH / 2, 150, 'You Lose!', {
            font: '64px Courier bold',
            fill: '#ffffff',
        }).setOrigin(0.5, 0.5)
        this.restartBtn = this.add.image(Config.BG_WIDTH / 2, Config.BG_HEIGHT / 2, 'restart').setOrigin(0.5, 0.5).setInteractive()
        this.restartBtn.on('pointerdown', () => app.scene.restart())
    }
}
export default GameScene