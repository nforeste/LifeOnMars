'use strict';

var gameOverMusic;
var gameOverMusic2;

var GameOver = function(game) {
    this.game = game;
};
GameOver.prototype = {
    preload: function() {
        //loads image (not in spritesheet) and audio
        this.load.path = ('assets/img/');
        this.load.image('gameover', 'gameover.png');
        this.load.path = ('assets/audio/');
        this.load.audio('powerDown', 'gameover.wav');
        this.load.audio('angryMob', 'gameover2.wav');
        console.log('GameOver: preload()');
    },
    create: function() {
        this.add.sprite(0, 0, 'gameover');

        var style = {
            font: '64px Impact',
            fill: 'white',
            wordWrap: false
        };

        this.titleText = this.game.add.text(265, 100, 'Game Over', style);

        style.font = '24px Arial Black';

        this.subText = this.game.add.text(240, 175, 'Press Space to try again', style);

        //plays powering down and angry mob music
        this.allowMultiple = true;
        gameOverMusic = this.game.add.audio('powerDown');
        gameOverMusic2 = this.game.add.audio('angryMob');
        gameOverMusic.play();
        gameOverMusic2.play();

        console.log('GameOver: create()');
    },
    update: function() {
        //checks for the space keypress
        if (this.game.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)) {
        	gameOverMusic.stop();
        	gameOverMusic2.stop();
            this.state.start('Play');
        }
    }
};