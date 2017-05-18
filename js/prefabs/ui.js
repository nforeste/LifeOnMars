function UserInterface(game, camera){
	//Phaser.Group.call(game);
	this.game = game;
	this.camera = camera;

	this.buttonBuilding = null;

	// Determines whether or not the user's cursor is hovering over the toolbar.
	this.canDrag = true;

	// Creates the visual toolbar located at the bottom of the screen.
	this.toolbar = this.game.add.sprite(0, this.camera.y+this.camera.height, 'buildings', 'Toolbar1');
	//this.toolbar.alpha = 0.7;
	this.toolbar.scale.y = .7;
	this.toolbar.anchor.setTo(.5, 1);
	this.toolbar.inputEnabled = true;

	this.game.UIObjects.add(this.toolbar);

	this.toolbarLength = 3;

	// Refers to position of toolbar on screen. DisplaceDef is the default value.
	this.yDisplaceDef = 4*(this.toolbar.height/5);
	this.yDisplace = this.yDisplaceDef;

	this.xDisplace = 0;
	this.xTween = null;

	// Setting the toolbar in the correct position.
	this.toolbar.y += this.yDisplace;

	// Boolean to test whether or not the player has the toolbar enabled.
	this.menuActive = false;

	this.buildingArray = ['HabitationUnit1x1Down', 'HabitationUnit2x1LeftRight', 'CommandCenter3x3', 'WaterTank2x1', 'WaterRecycler2x1', 'HabitationUnit2x2', 'WalkwayStraight', 'WalkwayCorner'];
	this.i;
	this.icons = this.game.add.group();
	this.icons.classType = Phaser.Button;

	this.icons.x = this.camera.x + this.camera.width/2;
	this.icons.y = this.toolbar.y;//this.camera.y + this.camera.height - this.yDisplaceDef;

	this.scaleFactor = 1.15;

	this.openTag = "Press E to open Inventory";
	this.closeTag = "Press E to close Inventory";
	this.tag = this.openTag;

	// Visual instructions for the toolbar.
	this.instructText = this.game.add.text(0, 0, this.openTag);
	this.instructText.anchor.setTo(.5, -.1);

	//this.instructText.font = 'Comic Sans MS'; LOL NO
	this.instructText.addColor('#01060f', 0);
	this.instructText.fontSize = 19;

	for(this.i=0; this.i<this.buildingArray.length; this.i++){
		this.indivIcon = this.icons.create( 2 * (this.i - Math.floor(this.toolbarLength/2)) * (this.camera.width/(this.toolbarLength*2)), 0, 'buildings');
		this.indivIcon.frameName = this.buildingArray[this.i];

		this.indivIcon.onInputDown.add(this.makeBuilding, this, 0, this.indivIcon);	
		this.indivIcon.onInputOver.add(this.hoverOver, this, 0, this.indivIcon, this.tag);
		this.indivIcon.onInputOut.add(this.hoverOut, this, 0, this.indivIcon, this.tag);

		this.indivIcon.y += (this.toolbar.height*this.toolbar.scale.y)/2;
		this.indivIcon.anchor.setTo(.5, .5);
		this.indivIcon.scale.x = (this.toolbar.height*this.toolbar.scale.y)/(this.indivIcon.width*1.5);
		this.indivIcon.scale.y = this.indivIcon.scale.x;
	}

	//this.icons.align(this.buildingArray.length, 1, 50, 50);
	//this.icons.pivot.x = this.camera.width/2;

}

UserInterface.prototype.display = function(){
	if(this.game.input.keyboard.justPressed(Phaser.Keyboard.E)){
		// If the menu is not activated, pull it up. Otherwise, close it.
    	if(this.menuActive == false){
    		this.game.add.tween(this).to({ yDisplace: 0 }, 300, Phaser.Easing.Quadratic.InOut, true);
    		this.menuActive = true;
    	} else {
    		this.game.add.tween(this).to({ yDisplace: this.yDisplaceDef }, 300, Phaser.Easing.Quadratic.InOut, true);
    		this.menuActive = false;
    	}

    	this.changeTag();
    }

    // This ensures that the icons only appear when the player has the toolbar enabled.
    /*if(this.menuActive){
    	this.icons.alpha = 100;
    } else {
    	this.icons.alpha = 0;
    }*/

	if(this.game.input.keyboard.justPressed(Phaser.Keyboard.A) && (this.xDisplace < 0) ){
		if(this.xTween!=null){
    		this.xTween = this.game.add.tween(this).to({ xDisplace: this.xDisplace+this.camera.width/this.toolbarLength }, 300, Phaser.Easing.Quadratic.InOut, true);
    	}
    }

    if( this.game.input.keyboard.justPressed(Phaser.Keyboard.D) && (this.xDisplace > -((this.buildingArray.length-this.toolbarLength)*this.camera.width)/this.toolbarLength) ){
    	if(this.menuActive){
    		this.xTween = this.game.add.tween(this).to({ xDisplace: this.xDisplace-this.camera.width/this.toolbarLength }, 300, Phaser.Easing.Quadratic.InOut, true);
    	}
    }

    this.icons.x = this.camera.x + this.camera.width/2 + this.xDisplace;
    this.icons.y = this.camera.y + this.camera.height - (this.yDisplaceDef - this.yDisplace);

	// Setting the toolbar and instruction text in the correct locations.
	this.toolbar.x = this.camera.x + this.camera.width/2;
	this.toolbar.y = this.camera.y + this.camera.height + this.yDisplace;
	this.instructText.x = this.toolbar.x;
	this.instructText.y = this.toolbar.y - this.toolbar.height;

	if(this.toolbar.input.pointerOver()){
		this.canDrag = false;
	} else {
		this.canDrag = true;
	}
};

UserInterface.prototype.makeBuilding = function(indivIcon){
	this.indivIcon = indivIcon;
	this.frame = this.indivIcon._frame.name;

	/*this.horizontalUnits = 0;
	this.verticalUnits = 0;
	this.rotateBool = false;
	this.otherFormations = null;*/

	//console.log(this.indivIcon._frame.name);

	if(this.frame == 'HabitationUnit1x1Down'){

		/*this.horizontalUnits = 1;
		this.verticalUnits = 1;
		this.rotateBool = true;
        this.otherformations = ['HabitationUnit1x1Left', 'HabitationUnit1x1Up', 'HabitationUnit1x1Right'];*/

        /*this.buttonBuilding = new OneByOne(this.game, 1, 1, 'buildings', this.frame, [
            'HabitationUnit1x1Left', 'HabitationUnit1x1Up', 'HabitationUnit1x1Right'
        ]);*/
        this.buttonBuilding = new Habitation1x1(this.game, 1, 1, 'buildings', 'HabitationUnit1x1Down', [
            'HabitationUnit1x1Left', 'HabitationUnit1x1Up', 'HabitationUnit1x1Right'
        ]);;

    } else if (this.frame == 'HabitationUnit2x1LeftRight') {
    	
    	/*this.horizontalUnits = 2;
    	this.verticalUnits = 1;
    	this.rotateBool = true;
    	this.otherFormations = ['HabitationUnit2x1UpDown'];*/

    	this.buttonBuilding = new Habitation2x1(this.game, 2, 1, 'buildings', 'HabitationUnit2x1LeftRight', [
            'HabitationUnit2x1UpDown'
        ]);

    } else if (this.frame == 'CommandCenter3x3'){
    	
    	/*this.horizontalUnits = 3;
    	this.verticalUnits = 3;*/

    	this.buttonBuilding = new CommandCenter(this.game, 3, 3, 'buildings', 'CommandCenter3x3');

    } else if (this.frame == 'WaterTank2x1'){

    	/*this.horizontalUnits = 2;
    	this.verticalUnits = 1;*/

    	this.buttonBuilding = new WaterTank2x1(this.game, 2, 1, 'buildings', 'WaterTank2x1');

    } else if (this.frame == 'WaterRecycler2x1'){

    	/*this.horizontalUnits = 2;
    	this.verticalUnits = 1;*/

    	this.buttonBuilding = new WaterRecycle2x1(this.game, 2, 1, 'buildings', this.frame);

    } else if (this.frame == 'HabitationUnit2x2'){

    	/*this.horizontalUnits = 2;
    	this.verticalUnits = 2;*/

    	this.buttonBuilding = new Habitation2x2(this.game, 2, 2, 'buildings', 'HabitationUnit2x2');

    } else if (this.frame == 'WalkwayStraight'){

    	/*this.horizontalUnits = 1;
    	this.verticalUnits = 1;*/

    	this.buttonBuilding = new Walkway(this.game, 1, 1, 'buildings', this.frame);

    } else if (this.frame == 'WalkwayCorner'){

    	/*this.horizontalUnits = 1;
    	this.verticalUnits = 1;*/

    	this.buttonBuilding = new Walkway(this.game, 1, 1, 'buildings', this.frame);

    }

    //this.buttonBuilding = new OneByOne(this.game, 1, 1, 'buildings', this.frame, [
    //        'HabitationUnit1x1Left', 'HabitationUnit1x1Up', 'HabitationUnit1x1Right'
    //    ]);

    //this.buttonBuilding = new Building(this.game, this.horizontalUnits, this.verticalUnits, 'buildings', this.frame, this.rotateBool, this.otherFormations);
    
    if(this.buttonBuilding != null){
    	this.buttonBuilding.x = this.game.input.mousePointer.x;
		this.buttonBuilding.y = this.game.input.mousePointer.y;
		this.buttonBuilding.purchased();
	}
	//console.log(this.buttonBuilding.held);
	//console.log(this.tag);
};

UserInterface.prototype.hoverOver = function(indivIcon){
	this.indivIcon = indivIcon;
	this.indivIcon.scale.x *= this.scaleFactor;
	this.indivIcon.scale.y = this.indivIcon.scale.x;
	this.frame = this.indivIcon._frame.name;

	this.tag = this.frame;
	this.changeTag();
};

UserInterface.prototype.hoverOut = function(indivIcon){
	this.indivIcon = indivIcon;
	this.indivIcon.scale.x *= (1/this.scaleFactor);
	this.indivIcon.scale.y = this.indivIcon.scale.x;
	this.frame = this.indivIcon._frame.name;

	this.tag = this.closeTag;
	this.changeTag();
};

UserInterface.prototype.changeTag = function(){
	if(this.tag == this.openTag){
		this.tag = this.closeTag;
	}

	if (this.menuActive){
		this.instructText.text = this.tag;
    } else {
    	this.instructText.text = this.openTag;
    }
};
