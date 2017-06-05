'use strict';

var backMusic;

var Menu = function(game) {
    this.game = game;
};

Menu.prototype = {

    preload: function() {
        //loads image (not in spritesheet) and audio
        this.load.image('menuimage', 'assets/img/menuimage.png');
        this.load.audio('backgroundmusic', 'assets/audio/spacemusic.mp3');
        console.log('Menu: preload()');
    },
    create: function() {
        this.add.sprite(0, 0, 'menuimage');

        var style = {
            font: '64px Impact',
            fill: 'black',
            wordWrap: false
        };

        this.titleText = this.game.add.text(30, 40, 'Life On Mars', style);

        style.font = '24px Arial Black';

        this.subText = this.game.add.text(50, 110, 'Press Enter to begin', style);

        //plays background music
        backMusic = this.game.add.audio('backgroundmusic');
        backMusic.play('', 0, 1, true, true);

        console.log('Menu: create()');
    },
    update: function() {
        //checks for the enter keypress
        if (this.game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
            backMusic.stop();
            this.state.start('Play');
        }
    }
};