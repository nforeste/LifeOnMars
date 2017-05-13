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

    //deleteIndex and gridDeleteIndex are readOnly
    if (this._deleteIndex >= 0) {
        this.connections.splice(this._deleteIndex, 1);
        this._gridDelete[0].connect.splice(this._gridDelete[1], 1);
    }

    for (let i = 0; i < this.connections.length; i++) {
        let x = this.connections[i][0];
        let y = this.connections[i][1];

        this.game.g.cells[x + xPos][y + yPos].connect.push(this.connections[i][2]);
        console.log('cell: (' + (x + xPos) + ', ' + (y + yPos) + ') = ' + this.connections[i][2]);
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

        if (xPos && yPos) {
            for (let i = 0; i < this.connections.length; i++) {
                let x = this.connections[i][0];
                let y = this.connections[i][1];

                if (this.connections[i][2] === this.UP) {
                    let tmp = this.game.g.cells[x + xPos][y + yPos - 1];

                    tmp.connect.forEach(function(c, j) {
                        if (c === this.DOWN) {
                            canPlace = true;
                            this._deleteIndex = i;
                            this._gridDelete = [tmp, j];
                        }
                    }, this);
                } else if (this.connections[i][2] === this.DOWN) {
                    let tmp = this.game.g.cells[x + xPos][y + yPos + 1];

                    tmp.connect.forEach(function(c, j) {
                        if (c === this.UP) {
                            canPlace = true;
                            this._deleteIndex = i;
                            this._gridDelete = [tmp, j];
                        }
                    }, this);
                } else if (this.connections[i][2] === this.LEFT) {
                    let tmp = this.game.g.cells[x + xPos - 1][y + yPos];

                    tmp.connect.forEach(function(c, j) {
                        if (c === this.RIGHT) {
                            canPlace = true;
                            this._deleteIndex = i;
                            this._gridDelete = [tmp, j];
                        }
                    }, this);
                } else {
                    let tmp = this.game.g.cells[x + xPos + 1][y + yPos];

                    tmp.connect.forEach(function(c, j) {
                        if (c === this.LEFT) {
                            canPlace = true;
                            this._deleteIndex = i;
                            this._gridDelete = [tmp, j];
                        }
                    }, this);
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
 *  Inherits from Building
 *  Defines a building that can be rotated
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
    if (this.held) {
        this.frameName = this.otherFrames[this.frameIndex++];
        this.frameIndex %= this.otherFrames.length;
        this.w = this.width / 32;
        this.h = this.height / 32;
    }
};

/**
 *  Inherits from RotatableBuilding + Building
 */
function Walkway(game, w, h, key, frame) {
    RotatableBuilding.call(this, game, w, h, key, frame);

    this.orientation = {
        x: 0,
        y: 0
    };

    this.connections.push([0, 0, this.DOWN]);
    this.connections.push([0, 0, this.UP]);
    this.connections.push([0, 0, this.LEFT]);
    this.connections.push([0, 0, this.RIGHT]);
}

Walkway.prototype = Object.create(RotatableBuilding.prototype);
Walkway.prototype.constructor = Walkway;

Walkway.prototype.rotate = function() {
    if (this.held) {
        this.angle += 90;

        if (this.orientation.x === 0 && this.orientation.y === 0) {
            this.orientation.y = 1;
        } else if (this.orientation.x > 0 && this.orientation.y === 0) {
            this.orientation.x = 0;
        } else if (this.orientation.y > 0 && this.orientation.x === 0) {
            this.orientation.x = 1;
        } else {
            this.orientation.y = 0;
        }
    }
};

/**
 *  Inherits from Building
 */
function ThreeByThree(game, w, h, key, frame) {
    Building.call(this, game, w, h, key, frame);

    this.connections.push([1, 0, this.UP]);
    this.connections.push([2, 1, this.RIGHT]);
    this.connections.push([1, 2, this.DOWN]);
    this.connections.push([0, 1, this.LEFT]);
}

ThreeByThree.prototype = Object.create(Building.prototype);
ThreeByThree.prototype.constructor = ThreeByThree;

/**
 *  Inherits from Building
 */
function TwoByTwo(game, w, h, key, frame) {
    Building.call(this, game, w, h, key, frame);

    this.connections.push([0, 0, this.LEFT]);
    this.connections.push([1, 0, this.UP]);
    this.connections.push([1, 1, this.RIGHT]);
    this.connections.push([0, 1, this.DOWN]);
}

TwoByTwo.prototype = Object.create(Building.prototype);
TwoByTwo.prototype.constructor = TwoByTwo;

/**
 *  Inherits from RotatableBuilding + Building
 */
function TwoByOne(game, w, h, key, frame, otherFrames) {
    RotatableBuilding.call(this, game, w, h, key, frame, otherFrames);

    this.connections.push([0, 0, this.DOWN]);
    this.connections.push([1, 0, this.UP]);
    this.rotated = 1;
}

TwoByOne.prototype = Object.create(RotatableBuilding.prototype);
TwoByOne.prototype.constructor = TwoByOne;

TwoByOne.prototype.rotate = function() {
    RotatableBuilding.prototype.rotate.call(this);

    if (this.held) {
        this.connections.forEach(function(c) {
            //this just swaps the contents of c[0] and c[1]
            [c[0], c[1]] = [c[1], c[0]];
            c[2] += this.rotated;
        }, this);
        this.rotated *= -1;
    }
};

/**
 *  Inherits from RotatableBuiling and Building
 */
function OneByOne(game, w, h, key, frame, otherFrames) {
    RotatableBuilding.call(this, game, w, h, key, frame, otherFrames);

    this.connections.push([0, 0, this.DOWN]);
}

OneByOne.prototype = Object.create(RotatableBuilding.prototype);
OneByOne.prototype.constructor = OneByOne;

OneByOne.prototype.rotate = function() {
    RotatableBuilding.prototype.rotate.call(this);

    if (this.held) {
        this.connections.forEach(function(c) {
            c[2] = (c[2] + 1) % 4;
        });
    }
};