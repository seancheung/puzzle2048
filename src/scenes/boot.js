import { Scene } from 'phaser';
import { SCALE_RATIO } from '../config';
import 'assets/ball.png';

export default class extends Scene {

    preload() {
        this.load.image('ball', 'assets/ball.png');
    }

    create() {
        const { width, height } = this.sys.game.config;
        this.add
            .graphics({ fillStyle: { color: 0x0000ff } })
            .fillRect(0, 0, width, height);
        this.ball = this.physics.add
            .image(width / 2, height / 2, 'ball')
            .setScale(SCALE_RATIO)
            .setCircle(50)
            .setCollideWorldBounds(true)
            .setBounce(1)
            .setVelocity(300);
    }

    update() {
        this.ball.rotation += 0.01;
    }

}
