'use strict';

var game;

window.onload = function() {
    //Game resolution is arbitrary at the moment
    game = new Phaser.Game(800, 600, Phaser.CANVAS);
    game.state.add('Play', Play);
    game.state.start('Play');
};