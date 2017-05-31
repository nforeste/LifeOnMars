'use strict';

function Resource(_game, currentAmount, storage, xpos, ypos, key, frame) {
    Phaser.Sprite.call(this, _game.game, xpos, ypos, key, frame);
    this.name = name;
    this.currentAmount = currentAmount;
    this.storage = storage;
    this.x = xpos;
    this.y = ypos;
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

    this.text = _game.add.text(this.x + 30, this.y - 8, this.currentAmount + '/' + this.storage, style);
    this.text.anchor.set(.5, 0);
    this.text.fixedToCamera = true;

    //Possibly replace this style with something more stylish :)
    //REMEMBER: when updating the context text need to update position to account for changed width
    let context = new Phaser.Text(_game.game, 2.5, 2.5, 'Income here\nOutput here', style);
    this.tooltip = new Phasetips(_game.game, {
        targetObject: this,
        context: context,
        fixedToCamera: true,
        padding: 5,
        x: this.x - (this.width / 2) - (context.width / 2),
        y: this.y + (this.height / 2) + 10,
    });
}

Resource.prototype = Object.create(Phaser.Sprite.prototype);
Resource.prototype.constructor = Resource;

Resource.prototype.update = function() {

};

Resource.prototype.add = function(amount) {
    this.currentAmount += amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);

    this._game.storageBuildings.forEach(b => {
        b.updateFrame();
    }, this);
};

Resource.prototype.increaseStorage = function(amount) {
    this.storage += amount;
    this.text.setText(this.currentAmount + '/' + this.storage);
};

Resource.prototype.subtract = function(amount) {
    this.currentAmount -= amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);

    this._game.storageBuildings.forEach(b => {
        b.updateFrame();
    }, this);
};