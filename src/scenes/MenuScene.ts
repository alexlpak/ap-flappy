import 'phaser';
import { state } from '../globals/state';
import { config } from '../globals/config';
import { options } from '../globals/options';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    };

    preload() {
        // preload player
        this.load.spritesheet('flappy', '../assets/objects/flappy-sprite.png', {
            frameWidth: 34,
            frameHeight: 24
        });
        this.load.image('base', '../assets/objects/base.png');
        this.load.image('background', '../assets/objects/background-day.png');
        this.load.image('message', '../assets/ui/message.png');
    };

    create() {
        state.background = this.add.image(0, 0, 'background').setOrigin(0, 0);

        state.base = this.add.tileSprite(config.width as number / 2, 456, 336, 112, 'base');
        state.base.depth = 100;

        state.player = this.physics.add.sprite(config.width as number / 2, config.height as number / 2, 'flappy');
        state.player.setCollideWorldBounds(true);
        state.player.anims.create({
            key: 'flap',
            frames: this.anims.generateFrameNumbers('flappy', { start: 0, end: 2 }),
            frameRate: 5
        });
        state.player.setGravityY(-options.gravity);

        this.add.image(config.width as number / 2, (config.height as number / 2), 'message');

        this.input.on('pointerdown', () => {
            this.scene.stop('MenuScene');
            this.scene.start('GameScene');
        });
    };

    update() {
        state.player.anims.play('flap', true);
        state.base.tilePositionX += options.speed;
    };
};