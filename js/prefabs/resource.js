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

    this.toolTips(frame);

    //Possibly replace this style with something more stylish :)
    //REMEMBER: when updating the context text need to update position to account for changed width
    // let context = new Phaser.Text(_game.game, 2.5, 2.5, 'Income here\nOutput here', style);
    // this.tooltip = new Phasetips(_game.game, {
    //     targetObject: this,
    //     context: context,
    //     fixedToCamera: true,
    //     padding: 5,
    //     x: this.x - (this.width / 2) - (context.width / 2),
    //     y: this.y + (this.height / 2) + 10,
    // });
}

Resource.prototype = Object.create(Phaser.Sprite.prototype);
Resource.prototype.constructor = Resource;

Resource.prototype.toolTips=function(frame){//all new
    var style = {
    font: '16px Helvetica Neue',
    fill: 'lightgray',
    wordWrap: false
};

    this._game.time.events.loop(60000, function(){
        let textIn='problem';
        let textOut='problem';
        if(frame==='WaterIcon')
        {
            textIn.setText('Per minute\n'
                +'  + '+this._game.building.buildCount[0]*12+' from Command Center\n'
                +'  + '+this._game.building.buildCount[12]*20+' from Ice mining\n'
                +'Maximum\n'
                +'  + '+this._game.building.buildCount[4]*15+' from Water Tank'
                );
            textOut.setText('Per minute\n'
                +'  + '+' water decay here'
                );
        }
        else if(frame==='FoodIcon')
        {
            textIn.setText('Per minute\n'
                +'  + '+this._game.building.buildCount[0]*12+' from Command Center\n'
                +'  + '+this._game.building.buildCount[8]*30+' from Hydroponics\n'
                +'Maximum\n'
                +'  + '+this._game.building.buildCount[9]*5+' from Storage 1x1\n'
                +'  + '+this._game.building.buildCount[10]*20+' from Storage 2x2'
                );
            textOut.setText('decay here');
        }
        else if(frame==='HousingIcon')
        {
            textIn.setText('Maximum\n'
                +'  +5 from Command Center'
                +'  + '+this._game.building.buildCount[1]*25+' from Habitation 2x2\n'
                +'  + '+this._game.building.buildCount[2]*12+' from Habitation 2x1\n'
                +'  + '+this._game.building.buildCount[3]*5+' from Habitation 1x1'
                );
            textOut.setText('');
        }
        else if(frame==='PowerIcon')
        {
            textIn.setText('Generation\n'
            +'  + '+this._game.building.buildCount[6]*10+' from Power Storage\n'
            +'  + '+this._game.building.buildCount[7]*2+' from Solar Pannels'
                );
            textOut.setText('');
        }
        else if(frame==='BrickIcon')
        {
            textIn.setText('Per minute\n'
            +'  + '+this._game.building.buildCount[11]*40+' from Brick mining\n'
            +'Maximum\n'
            +'  + '+this._game.building.buildCount[9]*10+' from Storage 1x1\n'
            +'  + '+this._game.building.buildCount[10]*40+' from Storage 2x2'
                );
            textOut.setText('');
        }

        let context = new Phaser.Text(_game.game, 2.5, 2.5, textIn+'\n'+textOut, style);
        this.tooltip = new Phasetips(_game.game, {
            targetObject: this,
            context: context,
            fixedToCamera: true,
            padding: 5,
            x: this.x - (this.width / 2) - (context.width / 2),
            y: this.y + (this.height / 2) + 10,
        });
    }, this);
};

Resource.prototype.update = function() {
    
};

Resource.prototype.add = function(amount) {
    this.currentAmount += amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);

    let text2 = this._game.add.text(this.x+30, this.y, '+'+amount, style1);//new
    text2.alpha = 1;
    this._game.add.tween(text2).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
    this._game.time.events.add(600, function() 
        {
        text2.destroy();
        });

    this._game.storageBuildings.forEach(b => {
        b.updateFrame();
    }, this);
};

Resource.prototype.increaseStorage = function(amount) {
    this.storage += amount;
    this.text.setText(this.currentAmount + '/' + this.storage);

    let text2 = this._game.add.text(this.x+60, this.y, '+'+amount, style3);//new
    text2.alpha = 1;
    this._game.add.tween(text2).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
    this._game.time.events.add(600, function() 
        {
        text2.destroy();
        });
};

Resource.prototype.subtract = function(amount) {
    this.currentAmount -= amount;
    this.currentAmount = Phaser.Math.clamp(this.currentAmount, 0, this.storage);
    this.text.setText(this.currentAmount + '/' + this.storage);

    let text2 = this._game.add.text(this.x+30, this.y, '+'+amount, style2);//new
    text2.alpha = 1;
    this._game.add.tween(text2).to({y: this.y - 32}, 500, Phaser.Easing.Linear.None, true);
    this._game.time.events.add(600, function() 
        {
        text2.destroy();
        });

    this._game.storageBuildings.forEach(b => {
        b.updateFrame();
    }, this);
};