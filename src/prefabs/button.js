import { GameObjects } from 'phaser';
import { BUTTON } from '../config';

export default class Button extends GameObjects.Sprite {

    constructor(scene, x, y, icon, cb) {
        super(scene, x, y, 'icons', icon);
        this.cb = cb;
        this.setOrigin(0.5);
        this.on('pointerdown', () => {
            this.setTint(BUTTON.CLICKED.COLOR).setScale(BUTTON.CLICKED.SCALE);
        });
        this.on('pointerup', event => {
            this.setTint(BUTTON.NORMAL.COLOR).setScale(BUTTON.NORMAL.SCALE);
            if (this.cb) {
                this.cb.call(this, event);
            }
        });
        this.setInteractive();
    }

}
