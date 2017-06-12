'use strict';

var Menu = function(game) {
    this.game = game;
};

Menu.prototype = {

    init: function() {
        this.stage.disableVisibilityChange = true;
    },

    preload: function() {
        //loads image (not in spritesheet) and audio
        this.load.image('menuimage', 'assets/img/menuimage.png');

        this.load.path = 'assets/audio/';
        this.load.audio('backgroundmusic', 'spacemusic.mp3');
        this.load.audio('backgroundmusic2', 'spacemusic2.mp3');
        this.load.audio('powerDown', 'gameover.mp3');
        this.load.audio('angryMob', 'gameover2.mp3');
        this.load.audio('construction', 'construction.mp3');
        this.load.audio('construction2', 'construction2.mp3');
        this.load.audio('construction3', 'construction3.mp3');
        this.load.audio('construction4', 'construction4.mp3');
        this.load.audio('construction5', 'construction5.mp3');
        this.load.audio('peopleArrive', 'peoplearrive.mp3');
        this.load.audio('place', 'place.mp3');
        this.load.audio('placeFail', 'placefail.mp3');
        this.load.audio('purchase', 'purchase.mp3');
        this.load.audio('rotate', 'rotate.mp3');
        this.load.audio('win', 'win.mp3');
        this.load.audio('zoom', 'zoom.mp3');
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

        //load music
        this.game.backMusic = this.add.audio('backgroundmusic');
        this.game.backMusic2 = this.add.audio('backgroundmusic2');
        this.game.gameOverMusic = this.add.audio('powerDown');
        this.game.gameOverMusic2 = this.add.audio('angryMob');
        this.game.buildMusic = this.add.audio('construction');
        this.game.buildMusic2 = this.add.audio('construction2');
        this.game.buildMusic3 = this.add.audio('construction3');
        this.game.buildMusic4 = this.add.audio('construction4');
        this.game.buildMusic5 = this.add.audio('construction5');
        this.game.arriveMusic = this.add.audio('peopleArrive');
        this.game.placeMusic = this.add.audio('place');
        this.game.placeFailMusic = this.add.audio('placeFail');
        this.game.buyMusic = this.add.audio('purchase');
        this.game.rotateMusic = this.add.audio('rotate');
        this.game.winMusic = this.add.audio('win');
        this.game.zoomMusic = this.add.audio('zoom');

        this.game.allowMultiple = true;

        //play menu theme
        this.game.backMusic.play('', 0, 1, true, true);
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