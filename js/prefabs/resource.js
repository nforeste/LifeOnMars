'use strict';

function Resource(game, currentAmount, storage, xpos, ypos, key){
	Phaser.Sprite.call(this, game, xpos, ypos, key);
	this.name=name;
	this.currentAmount=currentAmount;
	this.storage=storage;
	this.x=xpos;
	this.y=ypos;
	//this.button = game.add.button(xpos,ypos,key, clickAction,this);
	this.income=0;
	this.outcome=0;
	this.hovered=false;
	game.add.existing(this);
    this.inputEnabled = true;
    //var style={font:"12px Arial"}
    var style = { font: "18px Arial", wordWrap: false};
    this.text=game.add.text(this.x+50,this.y+20, this.currentAmount+'/'+this.storage,style);

    this.incomeText=game.add.text(this.x+30,this.y+45,'Income here',style);
	this.outcomeText=game.add.text(this.x+30,this.y+65,'Expences here',style);
	this.incomeText.alpha=0;
	this.outcomeText.alpha=0;
    //this.events.onInputDown.add(this.clickAction, this);
    if(key=='mats'){
    	this.addKey=game.input.keyboard.addKey(Phaser.Keyboard.M);
	}
	else if(key=='power'){
		this.addKey=game.input.keyboard.addKey(Phaser.Keyboard.N);
	}
	else if(key=='house'){
		this.addKey=game.input.keyboard.addKey(Phaser.Keyboard.B);
	}
	else if(key=='food'){
		this.addKey=game.input.keyboard.addKey(Phaser.Keyboard.V);
	}
	else if(key=='water'){
		this.addKey=game.input.keyboard.addKey(Phaser.Keyboard.C);
	}
}

Resource.prototype = Object.create(Phaser.Sprite.prototype);
Resource.prototype.constructor = Resource;

// Resource.prototype.clickAction=function(){
// 	var resText=this.currentAmount+'/'+this.storage;
// 	var text=game.add.text(this.x+40,this.y, resText);
// }

Resource.prototype.update = function(){
	//this.text.x=this.x+40;
	//this.text.y=this.y;

	this.text.setText(this.currentAmount+'/'+this.storage);
	//console.log(this.currentAmount+'/'+this.storage);
	this.incomeText.x=this.x+30;
	this.incomeText.y=this.y+45;
	this.outcomeText.x=this.x+30;
	this.outcomeText.y=this.y+65;
	//this.text.fixToCamera=true;
	if(this.input.pointerOver()){
		this.incomeText.alpha=.99;
		this.outcomeText.alpha=.99;
	}
	else{this.incomeText.alpha=0;
		this.outcomeText.alpha=0;
	}
	if (this.currentAmount>this.storage){this.currentAmount=this.storage;}
	if (this.addKey.isDown){this.currentAmount++;}

};

Resource.prototype.addIncome=function(amount){
	this.currentAmount+=amount;
};