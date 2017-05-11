'use strict';

/**
 * @param {Phaser.Game} game -- reference to the current game instance
 * @param {number} w -- width of the building (in grid cells)
 * @param {number} h -- height of the building (in grid cells)
 * @param {string} key -- the cached key of the building sprite
 * @param {string} frame -- (optional) image frame in a texture atlas/spritesheet
 * @param {boolean} rotatable -- (optional) if the building can rotate (default: false)
 * @param {array} otherFrames -- (optional) list of frames for that building (default: false)
 */
function Building(game, w, h, key, frame, rotatable, otherFrames) {
    Phaser.Sprite.call(this, game, 0, 0, key, frame);

    this.game = game;
    this.w = w;
    this.h = h;
    this.held = false;
    this.placed = false;
    this.rotatable = rotatable || false;
    this.orientation = {
        x: 0,
        y: 0
    };
    if (otherFrames) {
        this.otherFrames = otherFrames;
        this.otherFrames.push(frame);
        this.frameIndex = 0;
    }

    game.add.existing(this);
    game.gameWorld.add(this);

    //start at half resolution
    this.scale.set(.5);

    this.inputEnabled = true;
    //give the sprite button functionality
    this.events.onInputDown.add(this.clicked, this);

    game.input.keyboard.addKey(Phaser.Keyboard.R).onDown.add(this.rotate, this);
}

Building.prototype = Object.create(Phaser.Sprite.prototype);
Building.prototype.constructor = Building;

Building.prototype.clicked = function() {
    if (this.placed) {
        //open ui menu to look at building stats
    } else if (this.held) {
        //building no longer held, but placed
        this.held = false;
        this.placed = true;

        //anchor back in upper left corner to line up with grid
        this.anchor.x = this.orientation.x;
        this.anchor.y = this.orientation.y;
        //put opacity back at full
        this.alpha = 1;

        this.game.holdingBuilding = false;

        var xPos = this.game.g.xStart + this.game.g.upperLeftRow;
        var yPos = this.game.g.yStart + this.game.g.upperLeftColumn;

        //snap the building to the grid 
        this.x = xPos * 32;
        this.y = yPos * 32;

        //marks the cell as occupied
        this.game.g.cells[xPos][yPos] = 1;

        //clear the grid highlights
        this.game.g.bmdOverlay.clear();
    } else {
        //building has been initially clicked, not yet placed
        //reduce the opacity
        this.alpha = .75;
        this.held = true;
        this.game.holdingBuilding = true;
        this.game.gameWorld.bringToTop(this);

        //set the anchor so that it is in the middle of the mouse
        this.anchor.set(.5);
    }
};

Building.prototype.update = function() {
    if (this.held) {
        this.x = this.game.input.worldX / this.game.worldScale;
        this.y = this.game.input.worldY / this.game.worldScale;

        this.game.g.draw(this.w, this.h, 0.25);
    }
};

Building.prototype.rotate = function() {
    if (this.held && this.rotatable) {
        if (this.otherFrames !== undefined) {
            //In this case, the building is 'rotated' by replacing its sprite
            this.frameName = this.otherFrames[this.frameIndex++];
            this.frameIndex %= this.otherFrames.length;
            this.w = this.width / 32;
            this.h = this.height / 32;
        } else {
            this.angle += 90;
            //this ugly mess just moves the building's orientation so that it 
            //can be anchored correctly after rotation
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
    }
};