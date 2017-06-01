'use strict';

var Menu = function(game) {
    this.game = game;
};
Menu.prototype = {
    preload: function() {
        //loads image (not in spritesheet)
        this.load.image('menuimage', 'assets/img/menuimage.png');
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

        console.log('Menu: create()');
    },
    update: function() {
        //checks for the enter keypress
        if (this.game.input.keyboard.justPressed(Phaser.Keyboard.ENTER)) {
            this.state.start('Play');
        }
    }
};