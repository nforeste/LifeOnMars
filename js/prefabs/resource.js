'use strict';
var style1 = {
    font: '16px Helvetica Neue',
    fill: '#009900',
    wordWrap: false,
    fontWeight: 'bold'
};
var style2 = {
    font: '16px Helvetica Neue',
    fill: '#ff0000',
    wordWrap: false,
    fontWeight: 'bold'
};
var style3 = {
    font: '16px Helvetica Neue',
    fill: '#ff0000',
    wordWrap: false,
    fontWeight: 'bold'
};

function Resource(_game, currentAmount, storage, xpos, ypos, key, frame) {
    Phaser.Sprite.call(this, _game.game, xpos, ypos, key, frame);
    this.name = name;
    this.currentAmount = currentAmount;
    this.storage = storage;
    this.xPos = xpos;
    this.yPos = ypos;
    this._game = _game;

    this.anchor.set(1, .5);

    this.income = 0;
    this.outcome = 0;

    _game.add.existing(this);

    this.inputEnabled = true;
    this.fixedToCamera = true;

    var style = {
        font: '16px Helvetica Neue',
        fill: 'lightgray',
        wordWrap: false
    };

    this.text = _game.add.text(this.xPos + 30, this.yPos - 8, this.currentAmount + '/' + this.storage, style);
    this.text.anchor.set(.5, 0);
    this.text.fixedToCamera = true;
    this.tooltipHover = false;
    this.toolTips(frame);
}

Resource.prototype = Object.create(Phaser.Sprite.prototype);
Resource.prototype.constructor = Resource;

Resource.prototype.toolTips = function(frame) { //all new
    var style = {
        font: '16px Helvetica Neue',
        fill: 'lightgray',
        wordWrap: false
    };

    let timer = this._game.time.events.loop(0, function() {
        let textIn = 'problem';
        let textOut = 'problem';
        if (frame === 'WaterIcon') {
            textIn = 'Per minute\n' + '  + ' + this._game.game.buildCount[0] * 12 +
                ' from Command Center\n' + '  + ' + this._game.game.buildCount[12] * 20 +
                ' from Ice mining\n' + 'Maximum\n' + '  + ' + this._game.game.buildCount[4] * 15 +
                ' from Water Tank';
            textOut = 'Per minute\n' + '  + ' + ' water decay here';
        } else if (frame === 'FoodIcon') {
            textIn = 'Per minute\n' + '  + ' + this._game.game.buildCount[0] * 12 +
                ' from Command Center\n' + '  + ' + this._game.game.buildCount[8] * 30 +
                ' from Hydroponics\n' + 'Maximum\n' + '  + ' + this._game.game.buildCount[9] * 5 +
                ' from Storage 1x1\n' + '  + ' + this._game.game.buildCount[10] * 20 +
                ' from Storage 2x2';
            textOut = 'decay here';
        } else if (frame === 'HousingIcon') {
            textIn = 'Maximum\n' + '  +5 from Command Center\n' + '  + ' + this._game.game.buildCount[1] *
                25 + ' from Habitation 2x2\n' + '  + ' + this._game.game.buildCount[2] * 12 +
                ' from Habitation 2x1\n' + '  + ' + this._game.game.buildCount[3] * 5 +
                ' from Habitation 1x1';
            textOut = '';
        } else if (frame === 'PowerIcon') {
            textIn = 'Generation\n' + '  + ' + this._game.game.buildCount[6] * 10 + ' from Power Storage\n' +
                '  + ' + this._game.game.buildCount[7] * 2 + ' from Solar Panels';
            textOut = '';
        } else if (frame === 'BrickIcon') {
            textIn = 'Per minute\n' + '  + ' + this._game.game.buildCount[11] * 40 + ' from Brick mining\n' +
                'Maximum\n' + '  + ' + this._game.game.buildCount[9] * 10 + ' from Storage 1x1\n' + '  + ' +
                this._game.game.buildCount[10] * 40 + ' from Storage 2x2';
            textOut = '';
        }

        if (this.tooltip) {
            this.tooltip.destroy();
        }

        let context = new Phaser.Text(this._game.game, 5, 5, textIn + '\n' + textOut, style);
        this.tooltip = new Phasetips(this._game.game, {
            targetObject: this,
            ////////////////////////////////////////////////////
            font: 'Helvetica Neue',
            backgroundColor: 0x558388,
            context: context,
            fixedToCamera: true,
            padding: 10,
            x: this.xPos - (this.width / 2) - (context.width / 2),
            y: this.yPos + (this.height / 2) + 10,
            onHoverCallback: function() {
                this.tooltipHover = true;
            }.bind(this),
            onOutCallback: function() {
                this.tooltipHover = false;
            }.bind(this)
        });

        if (this.tooltipHover) {
            this.tooltip.showTooltip();
        }
    }, this);

    timer.delay = 10000;
};

Resource.prototype.update = function() {

};

Resource.prototype.add = function(amount) {
    this.currentAmount += amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);

    let text2 = this._game.add.text(this.xPos + 45, this.yPos - 2, '+' + amount, style1); //new
    text2.fixedToCamera = true;
    text2.anchor.set(.5, .5);
    this._game.add.tween(text2).to({
        angle: 20
    }, 500, Phaser.Easing.Linear.None, true);
    this._game.add.tween(text2.cameraOffset).to({
        y: this.yPos - 10
    }, 500, Phaser.Easing.Linear.None, true);
    this._game.time.events.add(600, function() {
        text2.destroy();
    });

    this._game.storageBuildings.forEach(b => {
        b.updateFrame();
    }, this);
};

Resource.prototype.increaseStorage = function(amount) {
    this.storage += amount;
    this.text.setText(this.currentAmount + '/' + this.storage);

    let text2 = this._game.add.text(this.xPos + 60, this.yPos - 2, '+' + amount, style3); //new
    text2.fixedToCamera = true;
    text2.anchor.set(.5, .5);
    this._game.add.tween(text2.cameraOffset).to({
        y: this.yPos - 10
    }, 500, Phaser.Easing.Linear.None, true);
    this._game.add.tween(text2).to({
        angle: 20
    }, 700, Phaser.Easing.Linear.None, true);
    this._game.time.events.add(600, function() {
        text2.destroy();
    });
};

Resource.prototype.subtract = function(amount) {
    this.currentAmount -= amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);

    let text2 = this._game.add.text(this.xPos + 45, this.yPos + 6, '-' + amount, style2); //new

    //player has run out of food or water
    if ((this.frameName === 'WaterIcon' || this.frameName === 'FoodIcon') && this.currentAmount === 0) {
        this._game.game.backMusic2.stop();
        this._game.state.start('GameOver');
    }

    text2.alpha = 1;
    text2.anchor.set(.5, .5);
    text2.fixedToCamera = true;
    this._game.add.tween(text2).to({
        angle: 20
    }, 700, Phaser.Easing.Linear.None, true);
    this._game.add.tween(text2.cameraOffset).to({
        y: this.yPos + 16
    }, 500, Phaser.Easing.Linear.None, true);
    this._game.time.events.add(600, function() {
        text2.destroy();
    });

    this._game.storageBuildings.forEach(b => {
        b.updateFrame();
    }, this);
};