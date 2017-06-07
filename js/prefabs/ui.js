function UserInterface(_game, camera) {
    // The New UI has a height 187 (not including the tabs)
    this.toolbarTabHeight = 69;
    this.toolbarBarHeight = 187;
    this.toolbarBarWidth = 621;
    this.toolbarBarStart = 156;
    this.toolbarBarEnd = 777;
    this.toolbarPanelStart = 166;
    this.toolbarPannelEnd = 211;

    //Phaser.Group.call(_game);
    this._game = _game;
    this.camera = camera;

    this.sprWidth = 32;

    this.buttonBuilding = null;

    // Determines whether or not the user's cursor is hovering over the toolbar. Hovering determines whether or not
    // the user is hovering over a button.
    this.hovering = false;

    // Boolean that instructs whether the user can drag an icon.
    this.canDrag = true;

    this.rotateButton = this._game.add.button(0, 0, 'rotateButton');
    //this.rotateButton.fontSize = 19;
    this.rotateButton.inputEnabled = true;
    this.rotateButton.anchor.setTo(0, .9);
    this.rotateButton.scale.setTo(.7, .7);
    this.rotateButton.events.onInputDown.add(this.rotBuilding, this);

    this.cancelButton = this._game.add.button(0, 0, 'cancelButton');
    //this.cancelButton.fontSize = 19;
    this.cancelButton.inputEnabled = true;
    this.cancelButton.anchor.setTo(1, .9);
    this.cancelButton.scale.setTo(.7, .7);
    this.cancelButton.events.onInputDown.add(this.canBuilding, this);

    // Creates the visual toolbar located at the bottom of the screen.
    this.toolbar = this._game.add.sprite(0, this.camera.y + this.camera.height, 'toolbar');
    this.toolbar.anchor.setTo(.5, 1);
    this.toolbar.scale.y = .8;
    this.toolbar.inputEnabled = true;
    this._game.UIObjects.add(this.toolbar);

    // This controls how many icons are on screen at once.
    this.toolbarLength = 3;

    // Refers to position of toolbar on screen. DisplaceDef is the default value.
    this.yDisplaceDef = this.toolbar.height - this.toolbarTabHeight * this.toolbar.scale.y;
    this.yDisplace = this.yDisplaceDef;

    // These correspond to the left/right tweens.
    this.xDisplace = 0;
    this.xTween = null;

    // Setting the toolbar in the correct position.
    this.toolbar.y += this.yDisplace;

    // These are the sections of the UI that pertain to walkways.
    // this.toolbarWalkway = this._game.add.sprite(0, this.toolbar.y - this.yDisplace, 'buildings', 'ToolbarTabs');
    // this.toolbarWalkway.anchor.setTo(.5, 1);
    // this.toolbarWalkway.scale.y = .75;

    // Boolean to test whether or not the player has the toolbar enabled.
    this.menuActive = false;

    // An array of buildings and their variables.
    this.buildings = {
        'WalkwayStraight': ['Walkway', 1, 1],
        'WalkwayCorner': ['Walkway', 1, 1],
        'BrickMine2x2': ['BrickMine2x2', 2, 2],
        'IceMine2x2': ['IceMine2x2', 2, 2],
        'Hydroponics2x2': ['Hydroponics2x2', 2, 2],
        'SolarPanel1x1': ['SolarPanel1x1', 1, 1],
        'PowerStorage2x1LeftRight': ['PowerStorage2x1', 2, 1, 'PowerStorage2x1UpDown'],
        'Habitation1x1Down': ['Habitation1x1', 1, 1, 'Habitation1x1Left', 'Habitation1x1Up', 'Habitation1x1Right'],
        'Habitation2x1LeftRight': ['Habitation2x1', 2, 1, 'Habitation2x1UpDown'],
        'Habitation2x2': ['Habitation2x2', 2, 2],
        'Storage1x1Down': ['Storage1x1', 1, 1, 'Storage1x1Left', 'Storage1x1Up', 'Storage1x1Right'],
        'Storage2x2': ['Storage2x2', 2, 2],
        'WaterTank2x1': ['WaterTank2x1', 2, 1],
        'WaterRecycler2x1LeftRight': ['WaterRecycler2x1', 2, 1, 'WaterRecycler2x1UpDown'],
        'LandingPad3x3': ['LandingPad3x3', 3, 3]
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
    this.icons.y = this.camera.y + this.camera.height + this.toolbar.height +
        (this.toolbarTabHeight * this.toolbar.scale.y);

    // This displays the name of the buildings under the icons.
    this.iconsText = this._game.add.group();
    this.iconsText.classType = Phaser.Text;
    this.iconsText.x = this.icons.x;
    this.iconsText.y = this.icons.y;

    // The text displayed above the UI toolbar.
    this.iconsTextStyle = {
        font: '13px Arial',
        fontWeight: 'bold',
        fill: '#01060f',
        align: 'center',
        boundsAlignH: 'center',
        boundsAlignV: 'top',
        wordWrap: 'true'
    };

    this.scaleFactor = 1.15;

    this.openTag = 'Press E to open Inventory';
    this.closeTag = 'Press E to close Inventory';
    this.tag = this.openTag;

    // The icon for the straight walkway.
    this.WalkwayLeft = this._game.add.button(0, this.toolbar.y - this.yDisplace, 'buildings');
    this.WalkwayLeft.frameName = 'WalkwayStraight';
    this.WalkwayLeft.anchor.setTo(.5, .5);
    this.WalkwayLeft.scale.setTo(.65, .65);
    this.WalkwayLeft.onInputOver.add(this.hoverOver, this, 0, this.WalkwayLeft, this.tag);
    this.WalkwayLeft.onInputOut.add(this.hoverOut, this, 0, this.WalkwayLeft, this.tag);
    this.WalkwayLeft.onInputDown.add(this.makeBuilding, this, 0, this.WalkwayLeft);

    // The icon for the corner walkway.
    this.WalkwayRight = this._game.add.button(0, this.toolbar.y - this.yDisplace, 'buildings');
    this.WalkwayRight.frameName = 'WalkwayCorner';
    this.WalkwayRight.anchor.setTo(.5, .5);
    this.WalkwayRight.scale.setTo(.63, .63);
    this.WalkwayRight.onInputOver.add(this.hoverOver, this, 0, this.WalkwayRight, this.tag);
    this.WalkwayRight.onInputOut.add(this.hoverOut, this, 0, this.WalkwayRight, this.tag);
    this.WalkwayRight.onInputDown.add(this.makeBuilding, this, 0, this.WalkwayRight);

    // Visual instructions for the toolbar.
    this.instructText = this._game.add.text(0, 0, this.openTag);
    this.instructText.anchor.setTo(.5, 1);
    this.instructText.inputEnabled = true;
    this.instructText.events.onInputDown.add(this.openMenu, this);

    //this.instructText.font = 'Comic Sans MS'; LOL NO
    this.instructText.addColor('#01060f', 0);
    this.instructText.fontSize = 19;

    this.rightArrow = this._game.add.button(0, 0, 'arrow');
    this.rightArrow.anchor.setTo(.5, .5);
    this.rightArrow.scale.setTo(-.5, .9);
    this.rightArrow.onInputDown.add(this.scroll, this, 0, 'right');

    this.leftArrow = this._game.add.button(0, 0, 'arrow');
    this.leftArrow.anchor.setTo(.5, .5);
    this.leftArrow.scale.setTo(.5, .9);
    this.leftArrow.onInputDown.add(this.scroll, this, 0, 'left');

    for (let i = 0; i < this.buildingArray.length; i++) {
        let indivIcon = this.icons.create(2 * (i - Math.floor(this.toolbarLength / 2)) * (this.toolbarBarWidth /
            (this.toolbarLength * 2)), 0, 'buildings');
        indivIcon.frameName = this.buildingArray[i];
        indivIcon.y += (this.toolbar.height * this.toolbar.scale.y) / 2;
        indivIcon.anchor.setTo(.5, .5);
        indivIcon.scale.x = (this.toolbar.height * this.toolbar.scale.y) / (indivIcon.width * 2.3);
        indivIcon.scale.y = indivIcon.scale.x;

        let indivIconText = this.iconsText.create(Math.round(indivIcon.x), Math.round(indivIcon.y),
            indivIcon.frameName, this.iconsTextStyle);
        indivIconText.setTextBounds(-indivIcon.width / 2, this.toolbar.height / 5, indivIcon.width, indivIcon.height);
        indivIconText.wordWrapWidth = this.camera.width / (this.toolbarLength * 3);

        indivIcon.onInputDown.add(this.makeBuilding, this, 0, indivIcon);
        indivIcon.onInputOver.add(this.hoverOver, this, 0, indivIcon);
        indivIcon.onInputOut.add(this.hoverOut, this, 0, indivIcon);
    }

    // This is how big the icons get once you hover over them.
    this.scaleFactor = 1.15;
}

UserInterface.prototype.display = function() {
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
    this.icons.y = this.toolbar.y - (this.toolbar.height * this.toolbar.scale.y);

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
};

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
            var buildingParams = building.slice(3, building.length);
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
    this.hovering = true;
    indivIcon.scale.x *= this.scaleFactor;
    indivIcon.scale.y = indivIcon.scale.x;
    let frame = indivIcon.frameName;

    this.tag = frame;
    this.changeTag();

    if (indivIcon.parent !== this.icons) {
        this.canDrag = false;
    }
};

UserInterface.prototype.hoverOut = function(indivIcon) {
    this.hovering = false;
    indivIcon.scale.x *= (1 / this.scaleFactor);
    indivIcon.scale.y = indivIcon.scale.x;
    this.frame = indivIcon.frameName;

    this.tag = this.closeTag;
    this.changeTag();

    if (indivIcon.parent !== this.icons) {
        this.canDrag = true;
    }
};

UserInterface.prototype.changeTag = function() {
    if (this.tag === this.openTag) {
        this.tag = this.closeTag;
    }

    if (this.menuActive) {
        this.instructText.text = this.tag;
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
    } else {
        this.yTween = this._game.add.tween(this).to({
            yDisplace: this.yDisplaceDef
        }, 300, Phaser.Easing.Quadratic.InOut, true);
        this.menuActive = false;
    }

    this.changeTag();
};

UserInterface.prototype.rotBuilding = function() {
    if (this._game.holdingBuilding && this.buttonBuilding && this.menuActive && (this.buttonBuilding instanceof RotatableBuilding)) {
        this.buttonBuilding.rotate();
    }
};

UserInterface.prototype.canBuilding = function() {
    if (this._game.holdingBuilding && this.buttonBuilding && this.menuActive) {
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
        }
    }
};