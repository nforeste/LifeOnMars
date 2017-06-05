'use strict';

var Menu = function(game) {
    this.game = game;
};

Menu.prototype = {

    preload: function() {
        //loads image (not in spritesheet) and audio
        this.load.image('menuimage', 'assets/img/menuimage.png');

        this.load.path = 'assets/audio/';
        this.load.audio('backgroundmusic', 'spacemusic.mp3');
        this.load.audio('backgroundmusic2', 'spacemusic2.mp3');
        this.load.audio('powerDown', 'gameover.wav');
        this.load.audio('angryMob', 'gameover2.wav');
        console.log('Menu: preload()');
    },
    create: function() {
        this.add.sprite(0, 0, 'menuimage');

        var style = {
            font: '64px Impact',
            fill: 'black',
            wordWrap: false
        };

        this.titleText = this.add.text(30, 40, 'Life On Mars', style);

        style.font = '24px Arial Black';

        this.subText = this.add.text(50, 110, 'Press Enter to begin', style);

        //load background music
        this.game.backMusic = this.add.audio('backgroundmusic');
        this.game.backMusic2 = this.add.audio('backgroundmusic2');
        this.game.gameOverMusic = this.add.audio('powerDown');
        this.game.gameOverMusic2 = this.add.audio('angryMob');

        //play menu theme
        this.game.backMusic.play('', 0, 1, true, true);

        console.log('Menu: create()');
    },
    update: function() {
        //checks for the enter keypress
        if (this.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
            this.game.backMusic.stop();
            this.game.backMusic2.play('', 0, 1, true, true);
            this.state.start('Play');
        }
    }
};