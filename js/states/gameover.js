'use strict';

var GameOver = function(game) {
    this.game = game;
};
GameOver.prototype = {
    preload: function() {
        //loads image (not in spritesheet) and audio
        this.load.path = ('assets/img/');
        this.load.image('gameover', 'gameover.png');
        this.load.path = ('assets/audio/');
        console.log('GameOver: preload()');
    },
    create: function() {
        this.add.sprite(0, 0, 'gameover');

        var style = {
            font: '64px Impact',
            fill: 'white',
            wordWrap: false
        };

        this.titleText = this.add.text(265, 100, 'Game Over', style);

        style.font = '24px Arial Black';

        this.subText = this.add.text(240, 175, 'Press Space to try again', style);

        //plays powering down and angry mob music
        this.allowMultiple = true;

        this.game.gameOverMusic.play();
        this.game.gameOverMusic2.play();

        console.log('GameOver: create()');
    },
    update: function() {
        //checks for the space keypress
        if (this.input.keyboard.justPressed(Phaser.Keyboard.SPACEBAR)) {
            this.game.gameOverMusic.stop();
            this.game.gameOverMusic2.stop();
            this.state.start('Play');
        }
    }
};