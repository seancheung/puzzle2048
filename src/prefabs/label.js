import { GameObjects } from 'phaser';

export default class Button extends GameObjects.Text {

    constructor(scene, x, y, text) {
        super(scene, x, y, text, {
            font: 'bold 22px Arial',
            align: 'center',
            color: 'white'
        });
        this.setOrigin(0.5);
    }

}
