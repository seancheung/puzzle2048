import { AUTO, Game } from 'phaser';
import Boot from './scenes/boot';
import { GRAVITY } from './config';

const config = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: GRAVITY } }
    },
    scene: Boot
};

const game = new Game(config);
window.addEventListener(
    'resize',
    () => game.resize(window.innerWidth, window.innerHeight),
    false
);
window.game = game;

export default game;
