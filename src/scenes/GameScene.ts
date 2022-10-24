import 'phaser';
import { options } from '../globals/options';
import { state } from '../globals/state';
import { config } from '../globals/config';

export default class GameScene extends Phaser.Scene {
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
        state.active = true;

        // create pipes        
        state.pipes = this.physics.add.group();

        state.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        state.base = this.add.tileSprite(config.width as number / 2, 456, 336, 112, 'base');
        state.base.depth = 100;
        
        function createPipe() {
            function randomIntFromInterval(min: number, max: number) { // min and max included 
                return Math.floor(Math.random() * (max - min + 1) + min)
            };
            if (state.active === true) {
                const gapSize = options.pipes.gap;
                const gapX = randomIntFromInterval(0  + options.pipes.boundsGap, config.height as number - options.pipes.boundsGap);

                const bottomPipe = state.pipes.create(config.width as number, gapX + gapSize, 'pipe').setOrigin(0, 0).setGravityY(-options.gravity);
                const topPipe: Phaser.Physics.Arcade.Sprite = state.pipes.create(config.width as number, gapX - gapSize, 'pipe').setOrigin(0, 1).setGravityY(-options.gravity);

                topPipe.flipY = true;
                topPipe.setImmovable(true);
                bottomPipe.setImmovable(true);
            }
        };

        function gameOver() {
            if (state.active) {
                state.active = false;
                state.sounds.die.play();
                state.sounds.hit.play();
            };
            state.pipeLoop.destroy();
        };

        state.pipeLoop = this.time.addEvent({
            delay: 1250,
            callback: createPipe,
            callbackScope: this,
            loop: true
        });

        // create player run animation
        state.player = this.physics.add.sprite(config.width as number / 2, config.height as number / 2, 'flappy');
        state.player.setCollideWorldBounds(true);
        state.player.anims.create({
            key: 'flap',
            frames: this.anims.generateFrameNumbers('flappy', { start: 0, end: 2 }),
            frameRate: 5
        });
        state.player.setGravityY(options.gravity);

        state.sounds = {
            die: this.sound.add('die'),
            hit: this.sound.add('hit'),
            point: this.sound.add('point'),
            swoosh: this.sound.add('swoosh'),
            wing: this.sound.add('wing')
        };

        // set collider
        this.physics.add.collider(state.player, state.pipes, function(player, pipe) {
            gameOver();
        });

        // create game input
        state.cursors = this.input.keyboard.createCursorKeys();

        this.input.on('pointerdown', () => {
            if (state.active === false) {
                this.scene.stop('GameScene');
                this.scene.start('MenuScene');
                return;
            };
            state.player.setVelocityY(-200);
            state.sounds.wing.play();
        });
    };

    update() {
        state.player.anims.play('flap', true);

        if (state.active === false) {
            state.pipeLoop.paused = true;
            this.add.image(config.width as number / 2, config.height as number / 2, 'gameover');
            state.player.anims.play('flap', false);
            if (state.player.body.bottom === config.height) this.physics.pause();
        };

        if (state.active) {
            state.base.tilePositionX += options.speed;
            state.pipes.getChildren().forEach((pipe: Phaser.Physics.Arcade.Sprite, index: number) => {
                pipe.x -= options.speed;
            });
            // set player rotation based on velocity
            const { velocity } = state.player.body;
            state.player.setRotation((velocity.y/options.gravity));
        };
    };
};