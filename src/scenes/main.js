import { Scene, Utils, Geom } from 'phaser';
import { TILE, BOARDCOLOR, MAX } from '../config';
import Tile from '../prefabs/tile';
import Panel from '../prefabs/panel';
import Button from '../prefabs/button';
import Label from '../prefabs/label';
import 'assets/icons.png';
import 'assets/icons.json';

const STATE = {
    NONE: 0,
    WIN: 1,
    LOSE: 2
};

export default class extends Scene {

    constructor() {
        super({ key: 'main' });
    }

    preload() {
        this.load.atlas('icons', 'assets/icons.png', 'assets/icons.json');
    }

    create() {
        this.events.on('resize', this.resize, this);
        this.panel = new Panel(this, TILE.SIZE * TILE.STEP, BOARDCOLOR);
        const undo = new Button(this, 0, 0, 'undo-button.png', () =>
            this.undo()
        );
        this.children.add(this.panel);
        this.children.add(undo);
        undo.setPosition(this.sys.game.config.width - undo.width, undo.height);
        const about = new Button(this, 0, 0, 'round-info-button.png');
        this.children.add(about);
        about.setPosition(about.width, about.height);
        const restart = new Button(this, 0, 0, 'refresh-button.png', () => {
            this.scene.restart();
        });
        this.children.add(restart);
        restart.setPosition(this.sys.game.config.width / 2, restart.height);
        this.timeLable = new Label(this, 0, 0, '--:--:--');
        this.children.add(this.timeLable);
        this.timeLable.setPosition(
            this.timeLable.width,
            this.sys.game.config.height - this.timeLable.height * 2
        );
        this.countLabel = new Label(this, 0, 0, '---');
        this.children.add(this.countLabel);
        this.countLabel.setPosition(
            this.sys.game.config.width / 2,
            this.sys.game.config.height - this.countLabel.height * 2
        );
        this.state = STATE.NONE;
        this.tiles = [];
        this.histories = [];
        this.capture = null;
        this.steps = 0;
        this.elapsedtime = 0;
        this.tileGroup = this.add.group();
        for (let i = 0; i < TILE.STEP; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < TILE.STEP; j++) {
                const tile = new Tile(
                    this,
                    j * TILE.SIZE + TILE.SIZE / 2,
                    i * TILE.SIZE + TILE.SIZE / 2,
                    0
                );
                this.tiles[i][j] = tile;
                this.tileGroup.add(tile);
                this.panel.add(tile);
            }
        }
        this.canMove = false;
        this.input.keyboard.on('keydown', this.handleKey, this);
        this.panel.on('pointerup', this.handleSwipe, this);
        this.populate();
        this.populate();
        this.captureTiles();
    }

    update(time, delta) {
        this.elapsedtime += delta;
        const elapsed = Math.floor(this.elapsedtime / 1000);
        let h = Math.floor(elapsed / 3600);
        let m = Math.floor((elapsed - h * 3600) / 60);
        let s = elapsed - h * 3600 - m * 60;
        h = `0${h}`.slice(-2);
        m = `0${m}`.slice(-2);
        s = `0${s}`.slice(-2);
        this.timeLable.setText(`${h}:${m}:${s}`);
    }

    populate(value) {
        const empty = [];
        for (let i = 0; i < TILE.STEP; i++) {
            for (let j = 0; j < TILE.STEP; j++) {
                if (this.tiles[i][j].value == 0) {
                    empty.push({
                        row: i,
                        col: j
                    });
                }
            }
        }
        const tile = Utils.Array.GetRandom(empty);
        this.tiles[tile.row][tile.col].setValue(value || 2);
        this.tweens.add({
            targets: this.tiles[tile.row][tile.col],
            alpha: 1,
            duration: TILE.SPEED,
            onComplete(tween) {
                tween.parent.scene.canMove = true;
            }
        });
    }

    handleKey(e) {
        if (this.canMove) {
            const children = this.tileGroup.getChildren();
            switch (e.code) {
            case 'KeyA':
                for (let i = 0; i < children.length; i++) {
                    children[i].depth = children[i].x;
                }
                this.handleMove(0, -1);
                break;
            case 'KeyD':
                for (let i = 0; i < children.length; i++) {
                    children[i].depth = this.panel.realSize - children[i].x;
                }
                this.handleMove(0, 1);
                break;
            case 'KeyW':
                for (let i = 0; i < children.length; i++) {
                    children[i].depth = children[i].y;
                }
                this.handleMove(-1, 0);
                break;
            case 'KeyS':
                for (let i = 0; i < children.length; i++) {
                    children[i].depth = this.panel.realSize - children[i].y;
                }
                this.handleMove(1, 0);
                break;
            case 'Escape':
                this.scene.restart();
                break;
            }
        }
    }

    handleSwipe(e) {
        const swipeTime = e.upTime - e.downTime;
        if (swipeTime < 1000) {
            const swipe = new Geom.Point(e.upX - e.downX, e.upY - e.downY);
            const swipeMagnitude = Geom.Point.GetMagnitude(swipe);
            if (swipeMagnitude > 20) {
                const swipeNormal = new Geom.Point(
                    swipe.x / swipeMagnitude,
                    swipe.y / swipeMagnitude
                );
                if (
                    Math.abs(swipeNormal.y) > 0.8 ||
                    Math.abs(swipeNormal.x) > 0.8
                ) {
                    if (Math.abs(swipeNormal.x) > Math.abs(swipeNormal.y)) {
                        if (swipeNormal.x > 0) {
                            this.handleMove(0, 1);
                        } else {
                            this.handleMove(0, -1);
                        }
                    } else if (swipeNormal.y > 0) {
                        this.handleMove(1, 0);
                    } else {
                        this.handleMove(-1, 0);
                    }
                }
            }
        }
    }

    handleMove(deltaRow, deltaCol) {
        this.canMove = false;
        this.movingTiles = 0;
        let moved = false;
        for (let i = 0; i < TILE.STEP; i++) {
            for (let j = 0; j < TILE.STEP; j++) {
                const colToWatch = deltaCol == 1 ? TILE.STEP - 1 - j : j;
                const rowToWatch = deltaRow == 1 ? TILE.STEP - 1 - i : i;
                const value = this.tiles[rowToWatch][colToWatch].value;
                if (value != 0) {
                    let colSteps = deltaCol;
                    let rowSteps = deltaRow;
                    while (
                        this.isInsideBoard(
                            rowToWatch + rowSteps,
                            colToWatch + colSteps
                        ) &&
                        this.tiles[rowToWatch + rowSteps][colToWatch + colSteps]
                            .value == 0
                    ) {
                        colSteps += deltaCol;
                        rowSteps += deltaRow;
                    }
                    if (
                        this.isInsideBoard(
                            rowToWatch + rowSteps,
                            colToWatch + colSteps
                        ) &&
                        this.tiles[rowToWatch + rowSteps][colToWatch + colSteps]
                            .value == value &&
                        this.tiles[rowToWatch + rowSteps][colToWatch + colSteps]
                            .upgradable &&
                        this.tiles[rowToWatch][colToWatch].upgradable
                    ) {
                        this.tiles[rowToWatch + rowSteps][
                            colToWatch + colSteps
                        ].value =
                            value * 2;
                        this.tiles[rowToWatch + rowSteps][
                            colToWatch + colSteps
                        ].upgradable = false;
                        this.tiles[rowToWatch][colToWatch].value = 0;
                        this.moveTile(
                            this.tiles[rowToWatch][colToWatch],
                            rowToWatch + rowSteps,
                            colToWatch + colSteps,
                            Math.abs(rowSteps + colSteps),
                            true
                        );
                        moved = true;
                    } else {
                        colSteps = colSteps - deltaCol;
                        rowSteps = rowSteps - deltaRow;
                        if (colSteps != 0 || rowSteps != 0) {
                            this.tiles[rowToWatch + rowSteps][
                                colToWatch + colSteps
                            ].value = value;
                            this.tiles[rowToWatch][colToWatch].value = 0;
                            this.moveTile(
                                this.tiles[rowToWatch][colToWatch],
                                rowToWatch + rowSteps,
                                colToWatch + colSteps,
                                Math.abs(rowSteps + colSteps),
                                false
                            );
                            moved = true;
                        }
                    }
                }
            }
        }
        if (!moved) {
            this.canMove = true;
        }
    }

    moveTile(tile, row, col, distance, changeNumber) {
        this.movingTiles++;
        this.tweens.add({
            targets: tile,
            x: col * TILE.SIZE + TILE.SIZE / 2,
            y: row * TILE.SIZE + TILE.SIZE / 2,
            duration: TILE.SPEED * distance,
            onComplete: () => {
                this.movingTiles--;
                if (changeNumber) {
                    this.transformTile(tile, row, col);
                }
                if (this.movingTiles == 0) {
                    this.resetTiles();
                    if (this.checkTiles()) {
                        this.populate();
                        this.captureTiles();
                    }
                }
            }
        });
    }

    transformTile(tile, row, col) {
        this.movingTiles++;
        tile.showValue(this.tiles[row][col].value);
        this.tweens.add({
            targets: tile,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: TILE.SPEED,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.movingTiles--;
                if (this.movingTiles == 0) {
                    this.resetTiles();
                    if (this.checkTiles()) {
                        this.populate();
                        this.captureTiles();
                    }
                }
            }
        });
    }

    resetTiles() {
        for (let i = 0; i < TILE.STEP; i++) {
            for (let j = 0; j < TILE.STEP; j++) {
                this.tiles[i][j].x = j * TILE.SIZE + TILE.SIZE / 2;
                this.tiles[i][j].y = i * TILE.SIZE + TILE.SIZE / 2;
                this.tiles[i][j].refresh();
            }
        }
    }

    checkTiles() {
        if (this.state !== STATE.NONE) {
            return false;
        }
        let count = 0,
            win;
        for (let i = 0; i < TILE.STEP; i++) {
            for (let j = 0; j < TILE.STEP; j++) {
                if (this.tiles[i][j].value >= MAX) {
                    win = true;
                    break;
                }
                if (this.tiles[i][j].value > 0) {
                    count++;
                }
            }
        }
        if (win) {
            this.state = STATE.WIN;
        } else if (count >= TILE.STEP * TILE.STEP) {
            this.state = STATE.LOSE;
        }

        return this.state === STATE.NONE;
    }

    captureTiles() {
        const capture = [];
        for (let i = 0; i < TILE.STEP; i++) {
            capture[i] = [];
            for (let j = 0; j < TILE.STEP; j++) {
                capture[i][j] = this.tiles[i][j].value;
            }
        }
        if (this.capture) {
            this.histories.push(this.capture);
            this.steps++;
        }
        this.capture = capture;
        this.countLabel.setText(`00${this.steps}`.slice(-3));
    }

    undo() {
        const history = this.histories.pop();
        if (history) {
            for (let i = 0; i < TILE.STEP; i++) {
                for (let j = 0; j < TILE.STEP; j++) {
                    this.tiles[i][j].setValue(history[i][j]);
                }
            }
            this.resetTiles();
            this.capture = history;
        }
    }

    isInsideBoard(row, col) {
        return row >= 0 && col >= 0 && row < TILE.STEP && col < TILE.STEP;
    }

    resize() {
        this.panel.resize();
    }

}
