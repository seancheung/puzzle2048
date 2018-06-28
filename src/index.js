import { AUTO, Game } from 'phaser';
import { BACKGROUND } from './config';
import Boot from './scenes/boot';
import Main from './scenes/main';

const config = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: BACKGROUND,
    autoFocus: true,
    scene: [Boot, Main]
};

const game = new Game(config);
window.addEventListener(
    'resize',
    () => game.resize(window.innerWidth, window.innerHeight),
    false
);

export default game;
