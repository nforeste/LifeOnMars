'use strict';

var game;

window.onload = function() {
	//Game resolution is arbitrary at the moment
	game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game');
	game.state.add('Menu', Menu);
	game.state.add('Play', Play);
	game.state.add('GameOver', GameOver);
	game.state.start('Menu');
};