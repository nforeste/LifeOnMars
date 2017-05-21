'use strict';

/*
 * @param {Phaser.Game} game -- reference to the current game instance
 * @param {number} min -- starting time (minutes)
 * @param {number} sec -- starting time (seconds)
 * @param {number} xpos -- starting x coordinate of the timer image
 * @param {number} ypos -- starting y coordinate of the timer image
 * @param {string} key -- the cached key of the building sprite
 * @param {string} frame -- (optional) image frame in a texture atlas/spritesheet
 */

// creates a timer image and numerical timer with text that appears upon being hovered over 
function Timer(game, min, sec, xpos, ypos, key, frame) {
    Phaser.Sprite.call(this, game, xpos, ypos, key, frame);
	this.game = game;
	this.min = min;
	this.sec = sec;
    this.milli = 0;
	this.x = xpos;
	this.y = ypos;
	this.hovered = false;
    game.add.existing(this);
    this.inputEnabled = true;
    this.fixedToCamera = true;
	var style = {
        font: '24px Arial',
        wordWrap: false
    };
    //displays the numerical timer
    this.text = game.add.text(this.x + 50, this.y + 20, '0' + this.min + ':' + '0' + this.sec, style);
    this.text.fixedToCamera = true;
	var style2 = {
        font: '18px Arial',
        wordWrap: false
    };
    //displays additional timer information
    this.timerText = game.add.text(this.x + 20, this.y + 45, 'Resource Update in 60 seconds', style2);
    this.timerText.alpha = 0;
    this.addKey = game.input.keyboard.addKey(Phaser.Keyboard.T);
}

Timer.prototype = Object.create(Phaser.Sprite.prototype);
Timer.prototype.constructor = Timer;

Timer.prototype.update = function() {
    //makes sure the time is displayed correctly regardless of the number of minutes or seconds
    if (this.sec < 10 && this.min < 10) {
    	this.text.setText('0' + this.min + ':' + '0' + this.sec);
    } else if (this.sec >= 10 && this.min < 10) {
        this.text.setText('0' + this.min + ':' + this.sec);
    } else if (this.sec < 10 && this.min >= 10) {
        this.text.setText(this.min + ':' + '0' + this.sec);
    } else if (this.sec >= 10 && this.min >= 10) {
        this.text.setText(this.min + ':' + this.sec);
    }

    //adds one minute to the timer every time 60 seconds pass
    if (this.sec == 60) {
        this.sec = this.sec - 60;
        this.min++;
    }

    //makes sure the additional information is accurate for any number of seconds
    this.resCount = 60 - this.sec;
    if (this.resCount == 1) {
        this.timerText.setText('Resource Update in 1 second');
    } else {
        this.timerText.setText('Resource Update in ' + this.resCount + ' seconds');
    }

	this.timerText.x = this.x + 20;
	this.timerText.y = this.y + 45;

    //makes the additional information appear when hovered over by the cursor
	if (this.input.pointerOver()) {
		this.timerText.alpha = .99;
	} else {
		this.timerText.alpha = 0;
	}
	if (this.addKey.isDown) {
		this.sec++;
	}

    //increments the timer
    if (this.milli == 60) {
        this.milli = 0;
        this.sec++;
    } else {
        this.milli++;
    }

};
