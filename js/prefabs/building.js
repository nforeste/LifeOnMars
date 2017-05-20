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

    game.add.existing(this);
    game.UIObjects.add(this);

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
    //this.events.onInputDown.addOnce(this.purchased, this);
}

Building.prototype = Object.create(Phaser.Sprite.prototype);
Building.prototype.constructor = Building;

Building.prototype.purchased = function() {
    this.alpha = .75;
    this.held = true;
    this.game.holdingBuilding = this;
    this.game.UIObjects.bringToTop(this);
    this.anchor.set(.5);
    this.scale.set(this.game.worldScale / 2);

    //Once an object is purchased, remove the resources
    Object.entries(this.cost).forEach(([key, value]) => {
        this.game.resources[key].subtract(value);
    }, this);

    this.events.onInputDown.addOnce(Building.prototype.place, this);
};

/**
 * @param  {number} xPosition -- (optional) x position to put the building
 * @param  {number} yPosition -- (optional) y position to put the building
 */
Building.prototype.place = function(xPosition, yPosition) {
    this.held = false;

    this.game.UIObjects.remove(this);
    this.game.gameObjects.add(this);

    //this.orientation only applies to buildings that 
    //rotate without new frames, otherwise it should set to 0
    if (this.orientation) {
        this.anchor.x = this.orientation.x;
        this.anchor.y = this.orientation.y;
    } else {
        this.anchor.set(0);
    }

    this.scale.set(.5);
    this.alpha = 1;
    this.game.holdingBuilding = null;

    //update the resources for each building (or start the loop to do so)
    this.updateResources();


    var xPos = (this.game.g.xStart + this.game.g.upperLeftRow) || xPosition;
    var yPos = (this.game.g.yStart + this.game.g.upperLeftColumn) || yPosition;

    this.x = xPos * 32;
    this.y = yPos * 32;

    // //update cell info here
    for (let i = xPos; i < xPos + this.w; i++) {
        for (let j = yPos; j < yPos + this.h; j++) {
            this.game.g.cells[i][j].occupied = this;
        }
    }


    //update the grid with the available connection points
    for (let i = 0; i < this.connections.length; i++) {
        let x = this.connections[i][0];
        let y = this.connections[i][1];

        this.game.g.cells[x + xPos][y + yPos].connect.push(this.connections[i][2]);
    }

    this.changeForm(xPos, yPos);

    //deleteIndex and gridDeleteIndex are readOnly
    if (this._deleteIndex >= 0) {
        this.connections.splice(this._deleteIndex, 1);
        this._gridDelete[0].connect.splice(this._gridDelete[1], 1);
    }

    this.game.g.bmdOverlay.clear();
    this.events.onInputDown.add(Building.prototype.getInfo, this);
};

Building.prototype.getInfo = function() {
    //UI popup to give player info about the building
};

Building.prototype.cancelPlacement = function() {
    //add back all of the resources the building costs
    Object.entries(this.cost).forEach(([key, value]) => {
        this.game.resources[key].add(value);
    }, this);

    //no longer holding a building, clear the grid highlights
    this.game.holdingBuilding = false;
    this.game.g.bmdOverlay.clear();

    //destroy the building sprite (not kill, which only changes visibility)
    this.destroy();
};

//When a building is placed, check all of its connection points
//to see if it is touching a walkway that needs to change,
//then call changeForm() recursively on that walkway
Building.prototype.changeForm = function(xPos, yPos) {
    this.connections.forEach(c => {
        if (c[2] === this.UP) {
            let tmp = this.game.g.cells[c[0] + xPos][c[1] + yPos - 1];

            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.changeForm(c[0] + xPos, c[1] + yPos - 1);
            }
        } else if (c[2] === this.RIGHT) {
            let tmp = this.game.g.cells[c[0] + xPos + 1][c[1] + yPos];
            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.changeForm(c[0] + xPos + 1, c[1] + yPos);
            }
        } else if (c[2] === this.DOWN) {
            let tmp = this.game.g.cells[c[0] + xPos][c[1] + yPos + 1];

            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.changeForm(c[0] + xPos, c[1] + yPos + 1);
            }
        } else {
            let tmp = this.game.g.cells[c[0] + xPos - 1][c[1] + yPos];

            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.changeForm(c[0] + xPos - 1, c[1] + yPos);
            }
        }
    }, this);
};

Building.prototype.updateResources = function() {
    //generic function that will be overriden by every building
    //updates resources based on the needs of the building
};

Building.prototype.hasResources = function() {
    //generic function that will be overriden by every building
    //checks to see if the player has enough resources to create a building
    return false;
};

//called every frame, override Phaser.Sprite.update
Building.prototype.update = function() {
    if (this.held) {
        this.x = this.game.input.worldX;
        this.y = this.game.input.worldY;

        var xPos = this.game.g.xStart + this.game.g.upperLeftRow;
        var yPos = this.game.g.yStart + this.game.g.upperLeftColumn;
        var highlightColor = '#66ff33';
        var opacity = .25;
        var canPlace = false;
        var blocked = false;
        this.events.onInputDown.active = true;

        if (xPos && yPos) {

            //check to see if the building is hovering over
            //any occupied squares, and if so mark it as blocked
            for (let i = xPos; i < xPos + this.w; i++) {
                for (let j = yPos; j < yPos + this.h; j++) {
                    if (this.game.g.cells[i][j].occupied) {
                        blocked = true;
                        break;
                    }
                }
            }


            //if the building isn't blocked by another building,
            //check to make sure that it has a connection point
            //with another building/walkway to attach to
            if (!blocked) {
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
        }

        //if the building can't be placed or is blocked,
        //make it not clickable and change the highlight color 
        //to red (to let the player know it can't be placed)
        if (!canPlace || blocked) {
            opacity = .5;
            highlightColor = '#facade';
            this.events.onInputDown.active = false;
        }

        this.game.g.draw(this.w, this.h, opacity, highlightColor);


        if (this.game.input.keyboard.addKey(Phaser.Keyboard.ESC).justPressed()) {
            this.cancelPlacement();
        }
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
        this.w = this.width / (32 * this.game.worldScale);
        this.h = this.height / (32 * this.game.worldScale);
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

    if (this.frameName === 'WalkwayStraight') {
        this.openPoints = [this.RIGHT, this.LEFT];
        this.closedPoints = [
            [this.UP, true],
            [this.DOWN, true]
        ];
    } else {
        //it is a walkway corner
        this.openPoints = [this.UP, this.RIGHT];
        this.closedPoints = [
            [this.DOWN, true],
            [this.LEFT, true]
        ];
    }

    this.rotAngle = 0;

    this.connections.push([0, 0, this.DOWN]);
    this.connections.push([0, 0, this.UP]);
    this.connections.push([0, 0, this.LEFT]);
    this.connections.push([0, 0, this.RIGHT]);
    this.cost = {
        mat: 1
    };
}

Walkway.prototype = Object.create(RotatableBuilding.prototype);
Walkway.prototype.constructor = Walkway;

Walkway.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};

Walkway.prototype.rotate = function() {
    if (this.held) {
        this.angle += 90;
        this.rotAngle = (this.rotAngle + 1) % 4;
        this.openPoints = this.openPoints.map(c => {
            return (c + 1) % 4;
        });

        this.closedPoints.forEach(c => {
            c[0] = (c[0] + 1) % 4;
        });

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
 * @param  {number} xPos -- the x position on the grid (cell number)
 * @param  {number} yPos -- the y position on the grid (cell number) 
 */
Walkway.prototype.changeForm = function(xPos, yPos) {
    let turnAngle = 0;

    //ok...
    //loop backwards through the open points
    //backwards so that the elements can be spliced without changing the index
    //if the direction contains something, (walkway or building ramp)
    //then add the direction as a closed point, remove it as an open point, 
    //and set the turn angle, which only applies for TShaped walkways
    let i = this.openPoints.length;
    while (i--) {
        if (this.openPoints[i] === this.UP) {
            let tmp = this.game.g.cells[xPos][yPos - 1];

            tmp.connect.forEach(c => {
                if (c === this.DOWN) {
                    this.closedPoints.push([this.UP, true]);
                    this.openPoints.splice(i, 1);
                    turnAngle = Math.abs(1 - this.rotAngle);
                }
            }, this);
        } else if (this.openPoints[i] === this.RIGHT) {
            let tmp = this.game.g.cells[xPos + 1][yPos];

            tmp.connect.forEach(c => {
                if (c === this.LEFT) {
                    this.closedPoints.push([this.RIGHT, true]);
                    this.openPoints.splice(i, 1);
                    turnAngle = Math.abs(2 - this.rotAngle);
                }
            }, this);
        } else if (this.openPoints[i] === this.DOWN) {
            let tmp = this.game.g.cells[xPos][yPos + 1];

            tmp.connect.forEach(c => {
                if (c === this.UP) {
                    this.closedPoints.push([this.DOWN, true]);
                    this.openPoints.splice(i, 1);
                    turnAngle = Math.abs(3 - this.rotAngle);
                }
            }, this);
        } else {
            let tmp = this.game.g.cells[xPos - 1][yPos];
            tmp.connect.forEach(c => {
                if (c === this.RIGHT) {
                    this.closedPoints.push([this.LEFT, true]);
                    this.openPoints.splice(i, 1);
                    turnAngle = 4 - this.rotAngle;
                }
            }, this);
        }
    }


    //here goes...
    //for every closed point, first filter which direction it is
    //then, check to make sure that direction is occupied by another Walkway
    //then, if the other walkway has an open point facing the current point,
    //recursively call this function to change that walkway as well
    for (let i = 0; i < this.closedPoints.length; i++) {
        if (this.closedPoints[i][1] && this.closedPoints[i][0] === this.UP) {
            let tmp = this.game.g.cells[xPos][yPos - 1];

            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.openPoints.forEach(c => {
                    if (c === this.DOWN) {
                        tmp.occupied.changeForm(xPos, yPos - 1);
                    }
                }, this);
            }
        } else if (this.closedPoints[i][1] && this.closedPoints[i][0] === this.RIGHT) {
            let tmp = this.game.g.cells[xPos + 1][yPos];

            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.openPoints.forEach(c => {
                    if (c === this.LEFT) {
                        tmp.occupied.changeForm(xPos + 1, yPos);
                    }
                }, this);
            }
        } else if (this.closedPoints[i][1] && this.closedPoints[i][0] === this.DOWN) {
            let tmp = this.game.g.cells[xPos][yPos + 1];

            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.openPoints.forEach(c => {
                    if (c === this.UP) {
                        tmp.occupied.changeForm(xPos, yPos + 1);
                    }
                }, this);
            }
        } else if (this.closedPoints[i][1] && this.closedPoints[i][0] === this.LEFT) {
            let tmp = this.game.g.cells[xPos - 1][yPos];

            if (tmp.occupied && tmp.occupied instanceof Walkway) {
                tmp.occupied.openPoints.forEach(c => {
                    if (c === this.RIGHT) {
                        tmp.occupied.changeForm(xPos - 1, yPos);
                    }
                }, this);
            }
        }
    }

    //if there are 3 closed points, then it is a T shaped walkway
    if (this.closedPoints.length === 3) {
        if (this.frameName === 'WalkwayCorner') {
            //if it is a corner, it needs to change angle
            //if it's even add one, odd subtract one
            turnAngle += turnAngle % 2 === 0 ? 1 : -1;
        }
        this.frameName = 'WalkwayTShape';

        this.rotAngle = (turnAngle + this.rotAngle) % 4;

        //The T-Shape needs to be rotated
        this.angle += 90 * turnAngle;
        for (let i = 0; i < turnAngle; i++) {
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
        this.anchor.x = this.orientation.x;
        this.anchor.y = this.orientation.y;

        //if there are 4 closed points, it is a 4-way walkway
    } else if (this.closedPoints.length === 4) {
        this.frameName = 'WalkwayCross';
    }
};


/**
 *  Inherits from Building
 */
function CommandCenter(game, w, h, key, frame) {
    Building.call(this, game, w, h, key, frame);

    this.connections.push([1, 0, this.UP]);
    this.connections.push([2, 1, this.RIGHT]);
    this.connections.push([1, 2, this.DOWN]);
    this.connections.push([0, 1, this.LEFT]);
    this.foodGain = 1;
    this.waterGain = 1;
}

CommandCenter.prototype = Object.create(Building.prototype);
CommandCenter.prototype.constructor = CommandCenter;

CommandCenter.prototype.updateResources = function() {
    this.game.time.events.loop(10000, function() {
        this.game.resources.food.add(1);
        this.game.resources.water.add(1);
    }, this);
};

/**
 *  Inherits from Building
 */
function Habitation2x2(game, w, h, key, frame) {
    Building.call(this, game, w, h, key, frame);

    this.connections.push([0, 0, this.LEFT]);
    this.connections.push([1, 0, this.UP]);
    this.connections.push([1, 1, this.RIGHT]);
    this.connections.push([0, 1, this.DOWN]);
    this.cost = {
        mat: 5
    };
}

Habitation2x2.prototype = Object.create(Building.prototype);
Habitation2x2.prototype.constructor = Habitation2x2;

Habitation2x2.prototype.updateResources = function() {
    this.game.resources.house.increaseStorage(15);
};

Habitation2x2.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};

/**
 *  Inherits from RotatableBuilding + Building
 */
function Habitation2x1(game, w, h, key, frame, otherFrames) {
    RotatableBuilding.call(this, game, w, h, key, frame, otherFrames);

    this.connections.push([0, 0, this.DOWN]);
    this.connections.push([1, 0, this.UP]);
    this.rotated = 1;
    this.cost = {
        mat: 3
    };
}

Habitation2x1.prototype = Object.create(RotatableBuilding.prototype);
Habitation2x1.prototype.constructor = Habitation2x1;

Habitation2x1.prototype.updateResources = function() {
    this.game.resources.house.increaseStorage(10);
};

Habitation2x1.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};

Habitation2x1.prototype.rotate = function() {
    RotatableBuilding.prototype.rotate.call(this);

    if (this.held) {
        this.connections.forEach(c => {
            //this just swaps the contents of c[0] and c[1]
            [c[0], c[1]] = [c[1], c[0]];
            c[2] += this.rotated;
        }, this);
        this.rotated *= -1;
    }
};

/**
 *  Inherits from RotatableBuilding and Building
 */
function Habitation1x1(game, w, h, key, frame, otherFrames) {
    RotatableBuilding.call(this, game, w, h, key, frame, otherFrames);

    this.connections.push([0, 0, this.DOWN]);
    this.cost = {
        mat: 2
    };
}

Habitation1x1.prototype = Object.create(RotatableBuilding.prototype);
Habitation1x1.prototype.constructor = Habitation1x1;

Habitation1x1.prototype.updateResources = function() {
    this.game.resources.house.increaseStorage(5);
};

Habitation1x1.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};

Habitation1x1.prototype.rotate = function() {
    RotatableBuilding.prototype.rotate.call(this);

    if (this.held) {
        this.connections.forEach(c => {
            c[2] = (c[2] + 1) % 4;
        });
    }
};

function WaterTank2x1(game, w, h, key, frame) {
    RotatableBuilding.call(this, game, w, h, key, frame);
    this.connections.push([0, 0, this.LEFT]);
    this.connections.push([1, 0, this.RIGHT]);
    this.orientation = {
        x: 0,
        y: 0
    };
    this.rotated = 1;
    this.cost = {
        mat: 5
    };
}

WaterTank2x1.prototype = Object.create(RotatableBuilding.prototype);
WaterTank2x1.prototype.constructor = WaterTank2x1;

WaterTank2x1.prototype.updateResources = function() {
    this.game.resources.water.increaseStorage(15);
};

WaterTank2x1.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};

WaterTank2x1.prototype.rotate = function() {
    if (this.held) {
        this.angle += 90 * this.rotated;
        //y orientation is 1 if angle is greater than 0 (+ before bool converts to number)
        this.orientation.y = +(this.angle > 0);
        let temp = this.w;
        this.w = this.h;
        this.h = temp;

        this.connections.forEach(c => {
            [c[0], c[1]] = [c[1], c[0]];
            c[2] = (c[2] + 4 + this.rotated) % 4;
        }, this);
        this.rotated *= -1;
    }
};

function WaterRecycler2x1(game, w, h, key, frame, otherFrames) {
    RotatableBuilding.call(this, game, w, h, key, frame, otherFrames);
    this.connections.push([0, 0, this.LEFT]);
    this.connections.push([1, 0, this.RIGHT]);
    this.rotated = 1;
    this.cost = {
        mat: 5
    };
}

WaterRecycler2x1.prototype = Object.create(RotatableBuilding.prototype);
WaterRecycler2x1.prototype.constructor = WaterRecycler2x1;

WaterRecycler2x1.prototype.updateResources = function() {
    this.game.time.events.loop(8000, function() {
        this.game.resources.water.add(2);
    }, this);
};

WaterRecycler2x1.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};

WaterRecycler2x1.prototype.rotate = function() {
    RotatableBuilding.prototype.rotate.call(this);

    if (this.held) {
        this.connections.forEach(c => {
            [c[0], c[1]] = [c[1], c[0]];
            c[2] = (c[2] + 4 + this.rotated) % 4;
        }, this);
        this.rotated *= -1;
    }
};

function PowerStorage2x1(game, w, h, key, frame, otherFrames) {
    RotatableBuilding.call(this, game, w, h, key, frame, otherFrames);
    this.connections.push([0, 0, this.DOWN]);
    this.connections.push([1, 0, this.UP]);
    this.rotated = 1;
    this.cost = {
        mat: 5
    };
}

PowerStorage2x1.prototype = Object.create(RotatableBuilding.prototype);
PowerStorage2x1.prototype.constructor = PowerStorage2x1;

PowerStorage2x1.prototype.updateResources = function() {
    this.game.resources.power.increaseStorage(10);
};

PowerStorage2x1.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};

PowerStorage2x1.prototype.rotate = function() {
    RotatableBuilding.prototype.rotate.call(this);
    if (this.held) {
        this.connections.forEach(c => {
            [c[0], c[1]] = [c[1], c[0]];
            c[2] += this.rotated;
        }, this);
        this.rotated *= -1;
    }
};

function SolarPanel1x1(game, w, h, key, frame) {
    RotatableBuilding.call(this, game, w, h, key, frame);
    this.connections.push([0, 0, this.DOWN]);
    this.orientation = {
        x: 0,
        y: 0
    };
    this.cost = {
        mat: 3
    };
}

SolarPanel1x1.prototype = Object.create(RotatableBuilding.prototype);
SolarPanel1x1.prototype.constructor = SolarPanel1x1;

SolarPanel1x1.prototype.updateResources = function() {
    this.game.time.events.loop(5000, function() {
        this.game.resources.power.add(1);
    }, this);
};

SolarPanel1x1.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};


SolarPanel1x1.prototype.rotate = function() {
    if (this.held) {
        this.connections.forEach(c => {
            c[2] = (c[2] + 1) % 4;
        });

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

function LandingPad3x3(game, w, h, key, frame) {
    Building.call(this, game, w, h, key, frame);
    this.connections.push([1, 0, this.UP]);
    this.connections.push([2, 1, this.RIGHT]);
    this.connections.push([1, 2, this.DOWN]);
    this.connections.push([0, 1, this.LEFT]);
    this.cost = {
        mat: 10
    };
}

LandingPad3x3.prototype = Object.create(Building.prototype);
LandingPad3x3.prototype.constructor = LandingPad3x3;

LandingPad3x3.prototype.hasResources = function() {
    return this.game.resources.mat.currentAmount >= this.cost.mat;
};