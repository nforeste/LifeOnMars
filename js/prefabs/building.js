'use strict';

function Building(game, w, h, key, frame) {
    Phaser.Sprite.call(this, game, 0, 0, key, frame);

    this.game = game;
    this.w = w;
    this.h = h;
    this.held = false;
    this.placed = false;

    game.add.existing(this);

    this.inputEnabled = true;
    //give the sprite button functionality
    this.events.onInputDown.add(this.clicked, this);
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
        this.anchor.set(0);
        //put opacity back at full
        this.alpha = 1;

        //snap the building to the grid 
        this.x = (this.game.g.xStart + this.game.g.upperLeftRow) * 32;
        this.y = (this.game.g.yStart + this.game.g.upperLeftColumn) * 32;

        //clear the grid highlights
        this.game.g.bmdOverlay.clear();
    } else {
        //building has been initially clicked, not yet placed
        //reduce the opacity
        this.alpha = .75;
        this.held = true;

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