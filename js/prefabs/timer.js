'use strict';

/*
 * @param {Phaser.Game} _game -- reference to the current _game instance
 * @param {number} min -- starting time (minutes)
 * @param {number} sec -- starting time (seconds)
 * @param {number} xpos -- starting x coordinate of the timer image
 * @param {number} ypos -- starting y coordinate of the timer image
 * @param {string} key -- the cached key of the building sprite
 * @param {string} frame -- (optional) image frame in a texture atlas/spritesheet
 */

// creates a timer image and numerical timer with text that appears upon being hovered over 
function Timer(_game, min, sec, xpos, ypos, key, frame) {
    Phaser.Sprite.call(this, _game.game, xpos, ypos, key, frame);
    this._game = _game;
    this.min = min;
    this.sec = sec;
    this.x = xpos;
    this.y = ypos;

    //interval of time before more resources arrive (in seconds)
    this.resourceInterval = 120;

    //anchor the sprite at the center
    this.anchor.set(.5);

    _game.add.existing(this);

    //enable event listeners on the sprite
    this.inputEnabled = true;
    this.fixedToCamera = true;

    //style of the timer text
    var style = {
        font: '24px Helvetica Neue',
        fill: 'lightgray',
        wordWrap: false
    };

    //displays the numerical timer
    this.text = _game.add.text(this.x + 16, this.y - 12, '0' + this.min + ':' + '0' + this.sec, style);
    this.text.fixedToCamera = true;

    //change the font size smaller for the subtext
    style.font = '18px Helvetica Neue';

    //displays additional timer information
    this.timerText = _game.add.text(this.x - 5, this.y + 15, 'Resource Update in ' +
        (this.resourceInterval * 60) + ' seconds', style);
    this.timerText.alpha = 0;
    this.timerText.fixedToCamera = true;

    //add events for hovering over the sprite and moving the mouse off the sprite
    this.events.onInputOver.add(this.hover, this);
    this.events.onInputOut.add(this.endHover, this);

    //every second increment the timer
    this._game.time.events.loop(1000, this.increaseTimer, this);
}

Timer.prototype = Object.create(Phaser.Sprite.prototype);
Timer.prototype.constructor = Timer;

Timer.prototype.increaseTimer = function() {
    this.sec++;
    if (this.sec % 60 === 0) {
        this.min++;
    }

    //if it has been the necessary number of minutes, more people arrive from earth
    if (this.sec === this.resourceInterval) {
        this._game.peopleArrive();
        this.sec = 0;
    }

    //set the main timer text every second (with leading 0s where appropriate)
    let sec = this.sec % 60;
    this.text.setText((this.min < 10 ? '0' : '') + this.min + ':' + (sec < 10 ? '0' : '') + sec);

    //set the secondary timer every second
    let remaining = this.resourceInterval - this.sec;
    this.timerText.setText('Resource Update in ' + remaining + ' second' + (sec === 59 ? '' : 's'));
};

Timer.prototype.hover = function() {
    this.timerText.alpha = .99;
};

Timer.prototype.endHover = function() {
    this.timerText.alpha = 0;
};

Timer.prototype.update = function() {

};