'use strict';

function Building(game, w, h, key, frame) {
    Phaser.Sprite.call(this, game, 0, 0, key, frame);

    this.game = game;
    this.w = w;
    this.h = h;
    this.held = false;
    this.placed = false;

    game.add.existing(this);
    this.components = game.add.group();
}

Building.prototype = Object.create(Phaser.Sprite.prototype);
Building.prototype.constructor = Building;

Building.prototype.clicked = function() {
    console.log('clicked');
};

Building.prototype.update = function() {
    this.components.x = this.x;
    this.components.y = this.y;
};