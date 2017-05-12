'use strict';

/**
 * @param {Phaser.Game} game -- reference to the current game instance
 * @param {number} w -- width of the building (in grid cells)
 * @param {number} h -- height of the building (in grid cells)
 * @param {string} key -- the cached key of the building sprite
 * @param {string} frame -- (optional) image frame in a texture atlas/spritesheet
 */
function Building(game, w, h, key, frame) {
    Phaser.Sprite.call(this, game, 0, 0, key, frame);

    this.game = game;
    this.w = w;
    this.h = h;
    this.held = false;
    this.placed = false;

    game.add.existing(this);
    game.gameWorld.add(this);

    //start at half resolution
    this.scale.set(.5);

    //store each building's connection points
    this.connections = [];
    this.DOWN = 0;
    this.LEFT = 1;
    this.UP = 2;
    this.RIGHT = 3;

    //give the sprite button functionality
    this.inputEnabled = true;

    //This will later be changed to somewhere else
    //Because the building object should be created
    //When this function is called
    this.events.onInputDown.addOnce(this.purchased, this);
}

Building.prototype = Object.create(Phaser.Sprite.prototype);
Building.prototype.constructor = Building;

Building.prototype.purchased = function() {
    this.alpha = .75;
    this.held = true;
    this.game.holdingBuilding = true;
    this.game.gameWorld.bringToTop(this);
    this.anchor.set(.5);
    this.events.onInputDown.addOnce(Building.prototype.placed, this);
};

Building.prototype.placed = function() {
    this.placed = true;
    this.held = false;

    //this.orientation only applies to walkways, otherwise it should set to 0
    if (this.orientation) {
        this.anchor.x = this.orientation.x;
        this.anchor.y = this.orientation.y;
    } else {
        this.anchor.set(0);
    }

    this.alpha = 1;
    this.game.holdingBuilding = false;

    var xPos = this.game.g.xStart + this.game.g.upperLeftRow;
    var yPos = this.game.g.yStart + this.game.g.upperLeftColumn;

    this.x = xPos * 32;
    this.y = yPos * 32;

    // //update cell info here
    // for (let i = xPos; i < xPos + this.w; i++) {
    //     for (let j = yPos; j < yPos + this.h; j++) {
    //         this.game.g.cells[i][j].occupied = true;
    //     }
    // }

    this.connections.splice(this.deleteIndex, 1);
    this.gridDeleteIndex.connect = -1;

    for (let i = 0; i < this.connections.length; i++) {
        let num = this.connections[i][0];
        let x = Math.floor(num / 10);
        let y = num % 10;

        this.game.g.cells[x + xPos][y + yPos].connect = this.connections[i][1];
        console.log('cell: (' + (x + xPos) + ', ' + (y + yPos) + ') = ' + this.connections[i][1]);
    }

    this.game.g.bmdOverlay.clear();
    this.events.onInputDown.add(Building.prototype.getInfo, this);
};

Building.prototype.getInfo = function() {
    //UI popup to give player info about the building
};

Building.prototype.update = function() {
    if (this.held) {
        this.x = this.game.input.worldX / this.game.worldScale;
        this.y = this.game.input.worldY / this.game.worldScale;

        var xPos = this.game.g.xStart + this.game.g.upperLeftRow;
        var yPos = this.game.g.yStart + this.game.g.upperLeftColumn;
        var highlightColor = '#66ff33';
        var opacity = .25;
        var canPlace = false;
        this.events.onInputDown.active = true;


        //TODO: 
        //-find a better solution for this pls :/
        this.deleteIndex = -1;
        this.gridDeleteIndex = this.game.g.cells[0][0];

        if (xPos && yPos) {
            for (let i = 0; i < this.connections.length; i++) {
                let num = this.connections[i][0];
                let x = Math.floor(num / 10);
                let y = num % 10;

                if (this.connections[i][1] === this.UP) {
                    if (this.game.g.cells[x + xPos][y + yPos - 1].connect === this.DOWN) {
                        canPlace = true;
                        this.deleteIndex = i;
                        this.gridDeleteIndex = this.game.g.cells[x + xPos][y + yPos - 1];
                    }
                } else if (this.connections[i][1] === this.DOWN) {
                    if (this.game.g.cells[x + xPos][y + yPos + 1].connect === this.UP) {
                        canPlace = true;
                        this.deleteIndex = i;
                        this.gridDeleteIndex = this.game.g.cells[x + xPos][y + yPos + 1];
                    }
                } else if (this.connections[i][1] === this.LEFT) {
                    if (this.game.g.cells[x + xPos - 1][y + yPos].connect === this.RIGHT) {
                        canPlace = true;
                        this.deleteIndex = i;
                        this.gridDeleteIndex = this.game.g.cells[x + xPos - 1][y + yPos];
                    }
                } else {
                    if (this.game.g.cells[x + xPos + 1][y + yPos].connect === this.LEFT) {
                        canPlace = true;
                        this.deleteIndex = i;
                        this.gridDeleteIndex = this.game.g.cells[x + xPos + 1][y + yPos];
                    }
                }
            }
        }

        if (!canPlace) {
            opacity = .5;
            highlightColor = '#facade';
            this.events.onInputDown.active = true;
        }

        this.game.g.draw(this.w, this.h, opacity, highlightColor);
    }
};

/**
 * A sublclass of Building, this defines a building that can be rotated
 */
function RotatableBuilding(game, w, h, key, frame, otherFrames) {
    Building.call(this, game, w, h, key, frame);

    if (otherFrames) {
        this.otherFrames = otherFrames;
        this.otherFrames.push(frame);
        this.frameIndex = 0;
    }

    var r = game.input.keyboard.addKey(Phaser.Keyboard.R);
    r.onDown.add(this.rotate, this);
}

RotatableBuilding.prototype = Object.create(Building.prototype);
RotatableBuilding.prototype.constructor = RotatableBuilding;

RotatableBuilding.prototype.rotate = function() {
    if (this.held && this.otherFrames) {
        this.frameName = this.otherFrames[this.frameIndex++];
        this.frameIndex %= this.otherFrames.length;
        this.w = this.width / 32;
        this.h = this.height / 32;
    }
};

/**
 * A subclass of Building, the walkway is a special case
 */
function Walkway(game, w, h, key, frame) {
    RotatableBuilding.call(this, game, w, h, key, frame);

    this.orientation = {
        x: 0,
        y: 0
    };

    this.connections.push([0, this.DOWN]);
    this.connections.push([0, this.UP]);
}

Walkway.prototype = Object.create(RotatableBuilding.prototype);
Walkway.prototype.constructor = Walkway;

Walkway.prototype.rotate = function() {
    if (this.held) {
        if (this.angle === 0) {
            this.angle = 90;
            this.orientation.y = 1;
            this.connections[0][0].left = false;
            this.connections[0][0].right = false;
            this.connections[0][0].up = true;
            this.connections[0][0].down = true;
        } else {
            this.angle = 0;
            this.orientation.y = 0;
            this.connections[0][0].left = true;
            this.connections[0][0].right = true;
            this.connections[0][0].up = false;
            this.connections[0][0].down = false;
        }
    }
};

function WalkwayCorner(game, w, h, key, frame) {
    Walkway.call(this, game, w, h, key, frame);
    this.connections[1] = [0, this.LEFT];
}

WalkwayCorner.prototype = Object.create(Walkway.prototype);
WalkwayCorner.prototype.constructor = WalkwayCorner;

WalkwayCorner.prototype.rotate = function() {
    if (this.held) {
        this.angle += 90;

        if (this.orientation.x === 0 && this.orientation.y === 0) {
            this.orientation.y = 1;
            this.connections[0][0].down = false;
            this.connections[0][0].up = true;
        } else if (this.orientation.x > 0 && this.orientation.y === 0) {
            this.orientation.x = 0;
            this.connections[0][0].right = false;
            this.connections[0][0].left = true;
        } else if (this.orientation.y > 0 && this.orientation.x === 0) {
            this.orientation.x = 1;
            this.connections[0][0].left = false;
            this.connections[0][0].right = true;
        } else {
            this.orientation.y = 0;
            this.connections[0][0].up = false;
            this.connections[0][0].down = true;
        }
    }
};

function CommandCenter(game, w, h, key, frame) {
    Building.call(this, game, w, h, key, frame);

    this.connections.push([10, this.UP]);
    this.connections.push([21, this.RIGHT]);
    this.connections.push([12, this.DOWN]);
    this.connections.push([1, this.LEFT]);
}

CommandCenter.prototype = Object.create(Building.prototype);
CommandCenter.prototype.constructor = CommandCenter;

/**
 * Habitation Unit inherits from the rotatable building object
 */
function HabUnit(game, w, h, key, frame, otherFrames) {
    RotatableBuilding.call(this, game, w, h, key, frame, otherFrames);

    if (otherFrames) {
        this.connections.push([0, this.DOWN]);
        if (w > 1) {
            this.connections.push([10, this.UP]);
        }
    } else {
        this.connections.push([0, this.LEFT]);
        this.connections.push([10, this.UP]);
        this.connections.push([11, this.RIGHT]);
        this.connections.push([1, this.DOWN]);
    }
}

HabUnit.prototype = Object.create(RotatableBuilding.prototype);
HabUnit.prototype.constructor = HabUnit;