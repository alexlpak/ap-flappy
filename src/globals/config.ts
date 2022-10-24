import MenuScene from '../scenes/MenuScene';
import GameScene from '../scenes/GameScene';
import { options } from './options';

export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    height: 512,
    width: 288,
    backgroundColor: 0x000000,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: options.gravity
            },
        },
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    pixelArt: true,
    parent: 'game',
    scene: [MenuScene, GameScene]
};