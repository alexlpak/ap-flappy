export const state = {
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