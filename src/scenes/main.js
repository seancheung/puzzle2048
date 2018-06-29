import { Scene, Utils, Geom } from 'phaser';
import { TILE, BOARDCOLOR } from '../config';
import Tile from '../prefabs/tile';
import Panel from '../prefabs/panel';

export default class extends Scene {

    constructor() {
        super({ key: 'main' });
    }

    create() {
        this.events.on('resize', this.resize, this);
        this.panel = new Panel(this, TILE.SIZE * TILE.STEP, BOARDCOLOR);
        this.children.add(this.panel);
        this.tiles = [];
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
        this.input.on('pointerup', this.handleSwipe, this);
        this.populate();
        this.populate();
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
            onComplete(tween) {
                tween.parent.scene.movingTiles--;
                if (changeNumber) {
                    tween.parent.scene.transformTile(tile, row, col);
                }
                if (tween.parent.scene.movingTiles == 0) {
                    tween.parent.scene.resetTiles();
                    tween.parent.scene.populate();
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
            onComplete(tween) {
                tween.parent.scene.movingTiles--;
                if (tween.parent.scene.movingTiles == 0) {
                    tween.parent.scene.resetTiles();
                    tween.parent.scene.populate();
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

    isInsideBoard(row, col) {
        return row >= 0 && col >= 0 && row < TILE.STEP && col < TILE.STEP;
    }

    resize() {
        this.panel.resize();
    }

}
