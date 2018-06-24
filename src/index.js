import * as Phaser from 'phaser';
import Boot from './scenes/boot';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 200 } }
    },
    scene: Boot
};

const game = new Phaser.Game(config);
window.addEventListener(
    'resize',
    () => game.resize(window.innerWidth, window.innerHeight),
    false
);
window.game = game;

export default game;
