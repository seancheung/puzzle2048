import { GameObjects, Geom } from 'phaser';

export default class Panel extends GameObjects.Container {

    constructor(scene, size, color) {
        super(scene);
        this.size = size;
        const shape = new Geom.Rectangle(0, 0, size, size);
        const board = new GameObjects.Graphics(scene, { fillStyle: { color } }).fillRectShape(shape);
        this.add(board);
        this.resize();
        this.setInteractive(shape, Geom.Rectangle.Contains);
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
