import { Scene } from 'phaser';
import 'assets/tile.png';

export default class extends Scene {

    constructor() {
        super({ key: 'boot' });
    }

    preload() {
        this.load.image('tile', 'assets/tile.png');
    }

    create() {
        this.scene.launch('main');
    }

}
