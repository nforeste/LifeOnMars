'use strict';

function Resource(game, currentAmount, storage, xpos, ypos, key, frame) {
    Phaser.Sprite.call(this, game, xpos, ypos, key, frame);
    this.name = name;
    this.currentAmount = currentAmount;
    this.storage = storage;
    this.x = xpos;
    this.y = ypos;

    this.anchor.set(.5);

    this.income = 0;
    this.outcome = 0;

    game.add.existing(this);

    this.inputEnabled = true;
    this.fixedToCamera = true;

    //var style={font:"12px Arial"}
    var style = {
        font: '16px Helvetica Neue',
        fill: 'lightgray',
        wordWrap: false
    };

    this.text = game.add.text(this.x + 18, this.y - 8, this.currentAmount + '/' + this.storage, style);
    this.text.fixedToCamera = true;

    this.incomeText = game.add.text(this.x, this.y + 15, 'Income here', style);
    this.outcomeText = game.add.text(this.x, this.y + 30, 'Expences here', style);

    this.incomeText.anchor.set(.5, 0);
    this.outcomeText.anchor.set(.5, 0);
    this.incomeText.alpha = 0;
    this.outcomeText.alpha = 0;
    this.incomeText.fixedToCamera = true;
    this.outcomeText.fixedToCamera = true;

    this.events.onInputOver.add(this.hover, this);
    this.events.onInputOut.add(this.endHover, this);
}

Resource.prototype = Object.create(Phaser.Sprite.prototype);
Resource.prototype.constructor = Resource;

Resource.prototype.hover = function() {
    this.incomeText.alpha = .99;
    this.outcomeText.alpha = .99;
};

Resource.prototype.endHover = function() {
    this.incomeText.alpha = 0;
    this.outcomeText.alpha = 0;
};

Resource.prototype.update = function() {

};

Resource.prototype.add = function(amount) {
    this.currentAmount += amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);
};

Resource.prototype.increaseStorage = function(amount) {
    this.storage += amount;
    this.text.setText(this.currentAmount + '/' + this.storage);
};

Resource.prototype.subtract = function(amount) {
    this.currentAmount -= amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);
};