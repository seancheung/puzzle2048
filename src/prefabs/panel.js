import { GameObjects } from 'phaser';

export default class Panel extends GameObjects.Container {

    constructor(scene, size, color) {
        super(scene);
        this.size = size;
        const board = new GameObjects.Graphics(scene, { fillStyle: { color } }).fillRect(0, 0, size, size);
        this.add(board);
        this.resize();
    }

    resize() {
        const { width, height } = this.scene.sys.game.config;
        const ratio = Math.min(width, height) / this.size;
        this.realSize = this.size * ratio;
        this.setScale(ratio).setPosition(
            width / 2 - this.realSize / 2,
            height / 2 - this.realSize / 2
        );
    }

}
