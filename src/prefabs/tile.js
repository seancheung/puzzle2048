import { GameObjects } from 'phaser';
import { TILE } from '../config';

export default class Tile extends GameObjects.Container {

    constructor(scene, x, y, value) {
        super(scene, x, y);
        this.value = value || 0;
        this.upgradable = false;
        const tile = new GameObjects.Sprite(scene, 0, 0, 'tile');
        const text = new GameObjects.Text(scene, 0, 0, this.value, {
            font: 'bold 64px Arial',
            align: 'center',
            color: 'black'
        });
        text.setOrigin(0.5);
        this.tile = tile;
        this.text = text;
        this.add([tile, text]);
        this.refresh();
    }

    setValue(value) {
        this.value = value;
        this.refresh();
    }

    showValue(value) {
        this.text.setText(value);
        this.tile.setTint(TILE.COLORS[value]);
        if (value > 0) {
            this.alpha = 1;
            this.visible = true;
        } else {
            this.alpha = 0;
            this.visible = false;
        }
    }

    refresh() {
        this.upgradable = true;
        this.showValue(this.value);
    }

}
