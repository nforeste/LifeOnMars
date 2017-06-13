function UserInterface(_game, camera) {
	this._game = _game;
	this.camera = camera;

	// These are values that concern the visual GUI.
	this.toolbarTabHeight = 69;
	this.toolbarBarHeight = 187;
	this.toolbarBarWidth = 621;
	this.toolbarBarStart = 156;
	this.toolbarBarEnd = 777;
	this.toolbarPanelStart = 166;
	this.toolbarPanelEnd = 211;
	this.toolbarBlockStart = 23;
	this.toolbarBlockEnd = 147;
	this.toolbarBlockStartVert = 91;
	this.toolbarBlockEndVert = 232;

	// These strings are the descriptions of the buildings.
	this.stringWalkway = 'Walkway: Connects buildings. Must have one between every building. Autosnaps.';
	this.stringBrickMine = 'Brick Mine: Mines building material from below the Martian surface. Must be built on ore terrain.';
	this.stringIceMine = 'Ice Mine: Mines water from ice below the Martian surface. Must be built on ice terrain. ';
	this.stringHyrdo = 'Hydroponics: Uses water to create sustainable crops with which to feed the colony.';
	this.stringSolar = 'Solar Panel: Generates power used to keep all the colony’s buildings running. Must be placed adjacent to a Power Storage.';
	this.stringPower = 'Power Storage: Stores power for the colony. Allows for solar panels to be placed around it. ';
	this.stringHab1x1 = 'Habitation 1x1: Provides minimal housing for colonists.';
	this.stringHab2x1 = 'Habitation 2x1: Provides adequate housing for colonists.';
	this.stringHab2x2 = 'Habitation 2x2: Provides substantial housing for colonists.';
	this.stringStore1x1 = 'Storage 1x1: Provides minimal storage space for food and building materials.';
	this.stringStore2x2 = 'Storage 2x2: Provides substantial storage space for food and building materials. ';
	this.stringWaterTank = 'Water Tank: Stores water for the colony. To be consumed by the colonists or to be used in the hydroponics bay.';
	this.stringWaterRecycler = 'Water Recycler: Recycles water, decreasing the amount of water that is completely lost. Will decrease the decay rate. ';
	this.stringLand = 'Landing Pad: Allows for better landing procedures for larger rockets from Earth. Shipments are able to carry food and water if the colony has a landing pad. Only one may be owned. ';

	// This is the variable that holds the current building being placed.
	this.buttonBuilding = null;

	// These variables track/determine user input.
	this.hovering = false;
	this.canDrag = true;
	this.canScroll = true;

	// A visual button that allows users to rotate their selections.
	this.rotateButton = this._game.add.button(0, 0, 'rotateButton');
	this.rotateButton.inputEnabled = true;
	this.rotateButton.anchor.setTo(0, .9);
	this.rotateButton.scale.setTo(.7, .7);
	this.rotateButton.onInputDown.add(this.rotBuilding, this);
	this.rotateButton.onInputOver.add(this.stopScroll, this, 0, 'Press [R] to Rotate');
	this.rotateButton.onInputOut.add(this.startScroll, this);

	// Another button that allows users to delete their selection before they place it
	this.cancelButton = this._game.add.button(0, 0, 'cancelButton');
	this.cancelButton.inputEnabled = true;
	this.cancelButton.anchor.setTo(1, .9);
	this.cancelButton.scale.setTo(.7, .7);
	this.cancelButton.onInputDown.add(this.canBuilding, this);
	this.cancelButton.onInputOver.add(this.stopScroll, this, 0, 'Press [ESC] to Cancel');
	this.cancelButton.onInputOut.add(this.startScroll, this);

	// Creates the visual toolbar located at the bottom of the screen.
	this.toolbar = this._game.add.sprite(this.camera.x + (this.camera.width / 2), this.camera.y + this.camera.height, 'toolbar');
	this.toolbar.anchor.setTo(.5, 1);
	this.toolbar.scale.y = .8;
	this.toolbar.inputEnabled = true;
	this._game.UIObjects.add(this.toolbar);

	// These control how many icons are on screen at once and how big icons can get.
	this.toolbarLength = 3;
	this.scaleFactor = 1.15;

	// Refers to position of toolbar on screen. DisplaceDef is the default value.
	this.yDisplaceDef = this.toolbar.height - this.toolbarTabHeight * this.toolbar.scale.y;
	this.yDisplace = this.yDisplaceDef;

	// These correspond to the left/right tweens.
	this.xDisplace = 0;
	this.xTween = null;

	// Setting the toolbar in the correct position.
	this.toolbar.y += this.yDisplace;

	// Boolean to test whether or not the player has the toolbar enabled.
	this.menuActive = false;

	// An array of buildings and their variables.
	this.buildings = {
		'WalkwayStraight': ['Walkway', 1, 1, this.stringWalkway],
		'WalkwayCorner': ['Walkway', 1, 1, this.stringWalkway],
		'BrickMine2x2': ['BrickMine2x2', 2, 2, this.stringBrickMine],
		'IceMine2x2': ['IceMine2x2', 2, 2, this.stringIceMine],
		'Hydroponics2x2': ['Hydroponics2x2', 2, 2, this.stringHyrdo],
		'SolarPanel1x1': ['SolarPanel1x1', 1, 1, this.stringSolar],
		'PowerStorage2x1LeftRight': ['PowerStorage2x1', 2, 1, 'PowerStorage2x1UpDown', this.stringPower],
		'Habitation1x1Down': ['Habitation1x1', 1, 1, 'Habitation1x1Left', 'Habitation1x1Up', 'Habitation1x1Right', this.stringHab1x1],
		'Habitation2x1LeftRight': ['Habitation2x1', 2, 1, 'Habitation2x1UpDown', this.stringHab2x1],
		'Habitation2x2': ['Habitation2x2', 2, 2, this.stringHab2x2],
		'Storage1x1Down': ['Storage1x1', 1, 1, 'Storage1x1Left', 'Storage1x1Up', 'Storage1x1Right', this.stringStore1x1,],
		'Storage2x2': ['Storage2x2', 2, 2, this.stringStore2x2],
		'WaterTank2x1': ['WaterTank2x1', 2, 1, this.stringWaterTank],
		'WaterRecycler2x1LeftRight': ['WaterRecycler2x1', 2, 1, 'WaterRecycler2x1UpDown', this.stringWaterRecycler],
		'LandingPad3x3': ['LandingPad3x3', 3, 3, this.stringLand]
	};



	// An array that holds the frame names of the buildings.
	this.buildingArray = ['BrickMine2x2', 'IceMine2x2', 'Habitation1x1Down', 'Habitation2x1LeftRight', 'Habitation2x2',
		'Storage1x1Down', 'Storage2x2', 'Hydroponics2x2', 'WaterTank2x1', 'WaterRecycler2x1LeftRight',
		'SolarPanel1x1', 'PowerStorage2x1LeftRight', 'LandingPad3x3'
	];

	// This instantiates the icons that users can click.
	this.icons = this._game.add.group();
	this.icons.classType = Phaser.Button;
	this.icons.x = this.camera.x + this.toolbarBarStart + this.toolbarBarWidth / 2;
	this.icons.y = this.camera.y + this.camera.height - (this.toolbarBarHeight * this.toolbar.scale.y) / 2;

	// This displays the name of the buildings under the icons.
	this.iconsText = this._game.add.group();
	this.iconsText.classType = Phaser.Text;
	this.iconsText.x = this.icons.x;
	this.iconsText.y = this.icons.y;

	// The text displayed above the UI toolbar.
	this.iconsTextStyle = {
		font: '13px Helvetica Neue',
		fontWeight: 'bold',
		fill: '#01060f',
		align: 'center',
		boundsAlignH: 'center',
		boundsAlignV: 'top',
		wordWrap: 'true'
	};
 
	// Strings for informational text located above the toolbar.
	this.openTag = 'Press [E] to open Inventory';
	this.closeTag = 'Press [E] to close Inventory';

	// The icon for the straight walkway.
	this.WalkwayLeft = this._game.add.button(0, this.toolbar.y - this.yDisplace, 'buildings');
	this.WalkwayLeft.frameName = 'WalkwayStraight';
	this.WalkwayLeft.anchor.setTo(.5, .5);
	this.WalkwayLeft.scale.setTo(.65, .65);
	this.WalkwayLeft.onInputOver.add(this.hoverOver, this, 0, this.WalkwayLeft);
	this.WalkwayLeft.onInputOut.add(this.hoverOut, this, 0, this.WalkwayLeft);
	this.WalkwayLeft.onInputDown.add(this.makeBuilding, this, 0, this.WalkwayLeft);

	// The icon for the corner walkway.
	this.WalkwayRight = this._game.add.button(0, this.toolbar.y - this.yDisplace, 'buildings');
	this.WalkwayRight.frameName = 'WalkwayCorner';
	this.WalkwayRight.anchor.setTo(.5, .5);
	this.WalkwayRight.scale.setTo(.65, .65);
	this.WalkwayRight.onInputOver.add(this.hoverOver, this, 0, this.WalkwayRight);
	this.WalkwayRight.onInputOut.add(this.hoverOut, this, 0, this.WalkwayRight);
	this.WalkwayRight.onInputDown.add(this.makeBuilding, this, 0, this.WalkwayRight);

	// Visual instructions for the toolbar.
	this.instructText = this._game.add.text(0, 0, this.openTag);
	this.instructText.anchor.setTo(.5, 1);
	this.instructText.inputEnabled = true;
	this.instructText.events.onInputDown.add(this.openMenu, this);
	this.instructText.addColor('#01060f', 0);
    this.instructText.fontSize = 19;

    // Allows users to scroll right on the toolbar.
	this.rightArrow = this._game.add.button(0, 0, 'arrow');
	this.rightArrow.anchor.setTo(.5, .5);
	this.rightArrow.scale.setTo(-.5, .9);
	this.rightArrow.onInputDown.add(this.scroll, this, 0, 'right');

	// Allows users to scroll left on the toolbar.
	this.leftArrow = this._game.add.button(0, 0, 'arrow');
	this.leftArrow.anchor.setTo(.5, .5);
	this.leftArrow.scale.setTo(.5, .9);
	this.leftArrow.onInputDown.add(this.scroll, this, 0, 'left');

	// Creates the icons seen in the toolbar and relevant attributes (text names, functions, etc.).
	for (let i = 0; i < this.buildingArray.length; i++) {
		let indivIcon = this.icons.create(2 * (i - Math.floor(this.toolbarLength / 2)) * (this.toolbarBarWidth /
			(this.toolbarLength * 2)), 0, 'buildings');
		indivIcon.frameName = this.buildingArray[i];
		indivIcon.y += (this.toolbar.height * this.toolbar.scale.y) / 2;
		indivIcon.anchor.setTo(.5, .5);
		indivIcon.scale.x = (this.toolbar.height * this.toolbar.scale.y) / (indivIcon.width * 2.5);
		indivIcon.scale.y = indivIcon.scale.x;

		indivIcon.onInputDown.add(this.makeBuilding, this, 0, indivIcon);
		indivIcon.onInputOver.add(this.hoverOver, this, 0, indivIcon);
		indivIcon.onInputOut.add(this.hoverOut, this, 0, indivIcon);

		let indivBuildingName = this.buildings[indivIcon.frameName][0];
		let indivBuilding = new window[indivBuildingName](this._game, this.buildings[indivIcon.frameName][1], this.buildings[
			indivIcon.frameName][2], 'buildings', indivIcon.frameName, null);

		let indivIconText = this.iconsText.create(Math.round(indivIcon.x), Math.round(indivIcon.y),
			indivBuildingName, this.iconsTextStyle);
		indivIconText.setTextBounds(-indivIcon.width / 2, this.toolbar.height / 5, indivIcon.width, indivIcon.height);
		indivIconText.wordWrapWidth = this.camera.width / (this.toolbarLength * 3);
		indivIconText.text = indivBuildingName + '\n' +
			(!indivBuilding.cost.power ? '' : 'P: ' + indivBuilding.cost.power) +
			(!indivBuilding.cost.mat ? '' : ' M: ' + indivBuilding.cost.mat);
		indivIconText.lineSpacing = -indivIconText.fontSize / 2;

		indivBuilding.destroy();

	}

	// Background for the top half of the UI.
	this.topBar = this._game.add.sprite(0, 0, 'topBar');
	this.topBar.scale.y = .83;

	// Visual indicator for how players are doing (images are license-free as far as I know).
	this.muskFace = this._game.add.sprite(this.camera.x + this.toolbarBlockStart, this.camera.y + this.camera.height - this.toolbar.y, 'muskHappy');
	this.muskFace.width = .63*(this.toolbarBlockEnd - this.toolbarBlockStart);
	this.muskFace.scale.y = this.muskFace.scale.x;
	this.muskFace.anchor.setTo(.5, .5);

	// Setting the alpha of UI elements.
	this.topBar.alpha = .85;
	this.toolbar.alpha = .85;

	// A button that allows players toreturn to the command center.
	this.commButton = this._game.add.button(this.camera.x, this.camera.y + this.topBar.height, 'commCenterButton');
	this.commButton.anchor.setTo(1, 0);
	this.commButton.onInputDown.add(this.goToCommand, this, 0, 1);
	this.commButton.onInputOver.add(this.displayInfoCenter, this);
}

UserInterface.prototype.display = function() {
	/*if (this.icons.pivot.y != this.icons.height/2){
		this.icons.pivot.y = this.icons.height/2;
	}*/

	if (this._game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
		this.openMenu();
	}

	if (this._game.input.keyboard.justPressed(Phaser.Keyboard.A)) {
		if (this._game.input.keyboard.justPressed(Phaser.Keyboard.D)) {
			this.scroll(null, null, 'neither');
		} else {
			this.scroll(null, null, 'left');
		}
	} else if (this._game.input.keyboard.justPressed(Phaser.Keyboard.D)) {
		this.scroll(null, null, 'right');
	}

	if (this._game.holdingBuilding) {
		if (this.buttonBuilding ? this.buttonBuilding instanceof RotatableBuilding : false) {
			this.rotateButton.visible = true;
		} else {
			this.rotateButton.visible = false;
		}
		this.cancelButton.visible = true;
	} else {
		this.rotateButton.visible = false;
		this.cancelButton.visible = false;
	}

	// Setting the toolbar and instruction text in the correct locations.
	this.toolbar.x = this.camera.x + this.camera.width / 2;
	this.toolbar.y = this.camera.y + this.camera.height + this.yDisplace;

	this.rotateButton.position.x = Math.round(this.camera.x + this.toolbarPanelStart);
	this.rotateButton.position.y = Math.round(this.toolbar.y - this.toolbarBarHeight * this.toolbar.scale.y);

	this.cancelButton.position.x = Math.round(this.camera.x + this.camera.width - this.toolbarPanelStart);
	this.cancelButton.position.y = Math.round(this.rotateButton.y);

	this.instructText.x = Math.round(this.toolbar.x);
	this.instructText.y = Math.round(this.toolbar.y - this.toolbarBarHeight * this.toolbar.scale.y);

	// When the menu is active, the yDisplace var is 0.
	this.icons.x = this.camera.x + this.toolbarBarStart + this.toolbarBarWidth / 2 + this.xDisplace;
	this.icons.y = this.toolbar.y - (this.toolbar.height * this.toolbar.scale.y * 1.09); //- this.toolbarBarHeight*this.toolbar.scale.y; //- (this.toolbarBarHeight * this.toolbar.scale.y)/2;

	this.iconsText.x = Math.round(this.icons.x);
	this.iconsText.y = Math.round(this.icons.y);

	this.leftArrow.x = this.camera.x + this.toolbarBarStart + .05 * this.toolbarBarWidth;
	this.leftArrow.y = this.toolbar.y - (this.toolbarBarHeight * this.toolbar.scale.y) / 2;
	this.rightArrow.x = this.camera.x + this.toolbarBarStart + .95 * this.toolbarBarWidth;
	this.rightArrow.y = this.leftArrow.y;

	this.WalkwayLeft.x = this.toolbar.x - .43 * this.camera.width; // The number is somewhat arbitrary, but it works.
	this.WalkwayRight.x = this.toolbar.x + .43 * this.camera.width;
	this.WalkwayLeft.y = this.camera.y + this.camera.height - this.toolbar.scale.y *
		(this.toolbarBarHeight + .45 * this.toolbarTabHeight) + this.yDisplace;
	this.WalkwayRight.y = this.WalkwayLeft.y;

	if (this.toolbar.input.pointerOver()) {
		this.canDrag = false;
		this.hovering = true;
	} else {
		this.hovering = false;
		this.canDrag = true;
	}

	for (let j = 0; j < this.icons.children.length; j++) {
		if ((this.icons.children[j].world.x < (this.camera.x + this.toolbarBarStart + this.icons.children[j].width)) ||
			(this.icons.children[j].world.x > (this.camera.x + this.toolbarBarEnd - this.icons.children[j].width))) {
			this.icons.children[j].alpha = 0;
			this.icons.children[j].inputEnabled = false;
			this.iconsText.children[j].alpha = 0;
		} else {
			this.icons.children[j].alpha = 1;
			this.icons.children[j].inputEnabled = true;
			this.iconsText.children[j].alpha = 1;
		}
	}

	this.topBar.x = this.camera.x;
	this.topBar.y = this.camera.y;

	this.muskFace.x = this.camera.x + this.toolbarBlockStart + (this.toolbarBlockEnd-this.toolbarBlockStart)/2;
	this.muskFace.y = this.toolbar.y - (this.toolbar.height - this.toolbarBlockEndVert*this.toolbar.scale.y)/2 - (this.toolbar.height - (this.toolbarBlockStartVert*this.toolbar.scale.y))/2;

	this.sad = false;
	for(var prop in this._game.resources){
		if(this._game.resources[prop].currentAmount < 5){
			this.sad = true
		}
	}

	if(this.buttonBuilding){
		if( this.buttonBuilding.constructing ){
			this.muskFace.loadTexture('muskConstruct');
		} else {
			if(this.sad){
				this.muskFace.loadTexture('muskSad');
			} else {
				this.muskFace.loadTexture('muskHappy');
			}
		}
	}

	this.commButton.x = this.camera.x + this.camera.width;
	this.commButton.y = this.camera.y + this.topBar.height - 1;

	if(Phaser.Math.distance(this.camera.x+this.camera.width/2, this.camera.y+this.camera.height/2, this._game.commandPos.x, this._game.commandPos.y) < (this.camera.width/2)){
		this.commButton.alpha = 0;
		this.commButton.inputEnabled = false;
	} else {
		this.commButton.alpha = (1.9*Phaser.Math.distance(this.camera.x, this.camera.y, this._game.commandPos.x, this._game.commandPos.y))/this._game.worldSize;
		this.commButton.inputEnabled = true;
	}
}

UserInterface.prototype.makeBuilding = function(indivIcon) {
	if (!this._game.holdingBuilding) {
		let frame = indivIcon.frameName;

		//get the current building info from the 'buildings' object
		let building = this.buildings[frame];
		let name = building[0];
		let width = building[1];
		let height = building[2];

		//if the building has other images, store that array
		if (building.length > 3) {
			var buildingParams = building.slice(3, building.length-1);
		}

		//Landing Pads can only be created once
		if (name === 'LandingPad3x3' && this._game.hasLandingPad) {
			return;
		}

		//call the building constructor directly through the window (only works on browsers)
		this.buttonBuilding = new window[name](this._game, width, height, 'buildings', frame, buildingParams);

		//if the player has enough resources, purchase the building
		if (this.buttonBuilding && this.buttonBuilding.hasResources()) {
			this.buttonBuilding.purchased();
		} else {
			this.buttonBuilding.destroy();
		}
	}
};

UserInterface.prototype.hoverOver = function(indivIcon) {
	let contextLength = this.buildings[indivIcon.frameName].length - 1;
	let contextString = this.buildings[indivIcon.frameName][contextLength];

	if ((indivIcon.world.x - this.camera.x) > 4 * (this.camera.width / 5)) {
		this.wrapDis = this.camera.x + this.camera.width - indivIcon.world.x;
	} else if ((indivIcon.world.x - this.camera.x) < (this.camera.width / 5)) {
		this.wrapDis = indivIcon.world.x - this.camera.x;
	} else {
		this.wrapDis = 301;
	}

	this.iconTip = new Phasetips(this._game.game, {
		targetObject: indivIcon,
		context: contextString,
		position: 'top',
		initialOn: false,
		positionOffset: 1.5 * (indivIcon.height / 2),
		animationDelay: 301,
		fontWordWrapWidth: this.wrapDis,
		backgroundColor: 0x558388,
		padding: 10
	});

	this.iconTip.simulateOnHoverOver();

	this.hovering = true;
	indivIcon.scale.x *= this.scaleFactor;
	indivIcon.scale.y = indivIcon.scale.x;

	if (indivIcon.parent !== this.icons) {
		this.canDrag = false;
	}

	//this.changeTag(this.buildings[indivIcon.frameName][0]);
};

UserInterface.prototype.hoverOut = function(indivIcon) {
	this.hovering = false;
	indivIcon.scale.x *= (1 / this.scaleFactor);
	indivIcon.scale.y = indivIcon.scale.x;
	this.frame = indivIcon.frameName;

	if (indivIcon.parent !== this.icons) {
		this.canDrag = true;
	}

	this.changeTag(this.closeTag);

	this.iconTip.destroy();
};

UserInterface.prototype.changeTag = function(customTag) {
	if(customTag){
		this.instructText.text = customTag;
	} else {
		this.instructText.text = this.openTag;
	}
};

UserInterface.prototype.openMenu = function() {
	if (!this.menuActive) {
		this.yTween = this._game.add.tween(this).to({
			yDisplace: 0
		}, 300, Phaser.Easing.Quadratic.InOut, true);
		this.menuActive = true;
		this._game.game.menuOpen.play('', 0, .25, false);
		this.changeTag('Press [E] to close inventory');
	} else {
		this.yTween = this._game.add.tween(this).to({
			yDisplace: this.yDisplaceDef
		}, 300, Phaser.Easing.Quadratic.InOut, true);
		this.menuActive = false;
		this._game.game.menuClose.play('', 0, .25, false);
		this.changeTag('Press [E] to open inventory');
	}
};

UserInterface.prototype.rotBuilding = function() {
	if (this._game.holdingBuilding && this.buttonBuilding && (this.buttonBuilding instanceof RotatableBuilding)) {
		this.buttonBuilding.rotate();
	}
};

UserInterface.prototype.canBuilding = function() {
	if (this._game.holdingBuilding && this.buttonBuilding) {
		this.buttonBuilding.cancelPlacement();
	}
};

UserInterface.prototype.scroll = function(button, pointer, dir) {
	if (dir === 'left') {
		this.targetSign = 1;
		this.boundsBool = this.xDisplace < 0;
	} else if (dir === 'right') {
		this.targetSign = -1;
		this.boundsBool = (this.xDisplace > -((this.buildingArray.length - this.toolbarLength) * this.toolbarBarWidth) /
			this.toolbarLength);
	} else {
		this.targetSign = 0;
		this.boundsBool = false;
	}


	if (this.menuActive && this.boundsBool) {
		if (!this.xTween ? true : !this.xTween.isRunning) {
			this.xTween = this._game.add.tween(this).to({
				xDisplace: this.xDisplace + this.targetSign * (this.toolbarBarWidth / this.toolbarLength)
			}, 215, Phaser.Easing.Quadratic.InOut, true);
			this._game.game.menuClick.play();
		}
	}
};

UserInterface.prototype.stopScroll = function(button, pointer, instructTag) {
	this.canScroll = false;
	this.changeTag(instructTag);
};

UserInterface.prototype.startScroll = function(button, pointer, instructTag) {
	this.canScroll = true;
	if(this.menuActive){
		this.changeTag(this.closeTag);
	} else {
		this.changeTag(this.openTag);
	}
};

UserInterface.prototype.goToCommand = function(button, pointer, frames){
	this._game.focusOnCommand();
	if(this.infoTip){
		this.infoTip.destroy();
	}
};

UserInterface.prototype.displayInfoCenter = function(){
	this.infoTip = new Phasetips(this._game.game, {
		targetObject: this.commButton,
		context: "Press [F] to return to command center",
		position: 'left',
		initialOn: false,
		positionOffset: 1.3 * (this.commButton.width),
		animationDelay: 151,
		backgroundColor: 0x558388,
		padding: 10
	});

	this.infoTip.simulateOnHoverOver();
};