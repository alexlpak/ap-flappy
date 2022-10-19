import 'phaser';

const gameOptions = {
    animation: {
        frameRate: 5
    },
    pipes: {
        gap: 50,
        boundsGap: 200
    },
    gravity: 500,
    speed: 1.5
};

const gameState = {
    player: {} as Phaser.Physics.Arcade.Sprite,
    cursors: {} as Phaser.Types.Input.Keyboard.CursorKeys,
    background: {} as Phaser.GameObjects.Image,
    base: {} as Phaser.GameObjects.TileSprite,
    active: true,
    pipes: {} as Phaser.Physics.Arcade.Group,
    pipeLoop: {} as Phaser.Time.TimerEvent,
    currentPipe: {} as Phaser.Physics.Arcade.Sprite,
    sounds: {
        die: {} as Phaser.Sound.BaseSound,
        hit: {} as Phaser.Sound.BaseSound,
        point: {} as Phaser.Sound.BaseSound,
        swoosh: {} as Phaser.Sound.BaseSound,
        wing: {} as Phaser.Sound.BaseSound,
    },
    tweens: {
        die: {} as Phaser.Tweens.Tween
    }
};

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    };

    preload() {
        // preload player
        this.load.spritesheet('flappy', '../assets/objects/flappy-sprite.png', {
            frameWidth: 34,
            frameHeight: 24
        });
        this.load.image('base', '../assets/objects/base.png');
        this.load.image('background', '../assets/objects/background-day.png');
        this.load.image('gameover', '../assets/ui/gameover.png');
        this.load.image('pipe', '../assets/objects/pipe-green.png');
        this.load.audio('wing', '../assets/sound/wing.wav');
        this.load.audio('hit', '../assets/sound/hit.wav');
        this.load.audio('swoosh', '../assets/sound/swoosh.wav');
        this.load.audio('die', '../assets/sound/die.wav');
        this.load.audio('point', '../assets/sound/point.wav');
    };

    create() {
        // this.sound.mute = true;
        gameState.active = true;

        // create background
        gameState.background = this.add.image(0, 0, 'background').setOrigin(0, 0);

        // create pipes        
        gameState.pipes = this.physics.add.group();
        
        function createPipe() {
            function randomIntFromInterval(min: number, max: number) { // min and max included 
                return Math.floor(Math.random() * (max - min + 1) + min)
            };
            if (gameState.active === true) {
                const gapSize = gameOptions.pipes.gap;
                const gapX = randomIntFromInterval(0  + gameOptions.pipes.boundsGap, config.height as number - gameOptions.pipes.boundsGap);

                const bottomPipe = gameState.pipes.create(config.width as number, gapX + gapSize, 'pipe').setOrigin(0, 0).setGravityY(-gameOptions.gravity);
                const topPipe: Phaser.Physics.Arcade.Sprite = gameState.pipes.create(config.width as number, gapX - gapSize, 'pipe').setOrigin(0, 1).setGravityY(-gameOptions.gravity);

                topPipe.flipY = true;
                topPipe.setImmovable(true);
                bottomPipe.setImmovable(true);
            }
        };

        function gameOver() {
            if (gameState.active) {
                gameState.active = false;
                gameState.sounds.die.play();
                gameState.sounds.hit.play();
            };
            gameState.pipeLoop.destroy();
        };

        gameState.pipeLoop = this.time.addEvent({
            delay: 1250,
            callback: createPipe,
            callbackScope: this,
            loop: true
        });

        // create player run animation
        gameState.player = this.physics.add.sprite(config.width as number / 2, config.height as number / 2, 'flappy');
        gameState.player.setCollideWorldBounds(true);
        gameState.player.anims.create({
            key: 'flap',
            frames: this.anims.generateFrameNumbers('flappy', { start: 0, end: 2 }),
            frameRate: 5
        });
        
        // create base
        gameState.base = this.add.tileSprite(config.width as number / 2, 456, 336, 112, 'base');
        gameState.base.depth = 100;

        this.physics.add.collider(gameState.player, gameState.base, function(player, base) {
            gameOver();
        });

        gameState.sounds = {
            die: this.sound.add('die'),
            hit: this.sound.add('hit'),
            point: this.sound.add('point'),
            swoosh: this.sound.add('swoosh'),
            wing: this.sound.add('wing')
        };

        // set collider
        this.physics.add.collider(gameState.player, gameState.pipes, function(player, pipe) {
            gameOver();
        });

        // create game input
        gameState.cursors = this.input.keyboard.createCursorKeys();

        // click event for restarting the game
        this.input.on('pointerup', () => {
            if (gameState.active === false) {
                this.scene.restart();
            };
        });
    };

    update() {
        gameState.player.anims.play('flap', true);
        if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
            gameState.player.setVelocityY(-200);
            gameState.sounds.wing.play();
        };

        if (gameState.active === false) {
            gameState.pipeLoop.paused = true;
            this.add.image(config.width as number / 2, config.height as number / 2, 'gameover');
            gameState.player.anims.play('flap', false);
            if (gameState.player.body.bottom === config.height) this.physics.pause();
        };

        if (gameState.active) {
            gameState.base.tilePositionX += gameOptions.speed;
            gameState.pipes.getChildren().forEach((pipe: Phaser.Physics.Arcade.Sprite, index: number) => {
                pipe.x -= gameOptions.speed;
                // destroy pipe when out of view
                if (pipe.getBounds().x < -pipe.displayWidth) pipe.destroy();
                // const overPipe = pipe.getBounds().x/gameState.player.getBounds().x < 1;
                // if (overPipe) {
                //     if (gameState.currentPipe !== pipe) {
                //         gameState.currentPipe = pipe;
                //         console.log('counting');
                //     };
                // };
            });
            // set player rotation based on velocity
            const { velocity } = gameState.player.body;
            gameState.player.setRotation((velocity.y/gameOptions.gravity));
        };
    };
};

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    height: 512,
    width: 288,
    backgroundColor: 0x000000,
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            gravity: {
                y: gameOptions.gravity
            },
        },
    },
    // fps: {
    //     target: 60,
    //     forceSetTimeOut: true
    // },
    pixelArt: true,
    parent: 'game',
    scene: [GameScene]
};

const game = new Phaser.Game(config);