function UserInterface(_game, camera) {
    //Phaser.Group.call(_game);
    this._game = _game;
    this.camera = camera;

    this.buttonBuilding = null;


    // Determines whether or not the user's cursor is hovering over the toolbar. Hovering determines whether or not
    // the user is hovering over a button.
    this.canDrag = true;
    this.hovering = false;

    // Creates the visual toolbar located at the bottom of the screen.
    this.toolbar = this._game.add.sprite(0, this.camera.y + this.camera.height, 'buildings', 'Toolbar1');
    //this.toolbar.alpha = 0.7;
    this.toolbar.scale.y = .7;
    this.toolbar.anchor.setTo(.5, 1);
    this.toolbar.inputEnabled = true;

    this._game.UIObjects.add(this.toolbar);

    this.toolbarLength = 3;

    // Refers to position of toolbar on screen. DisplaceDef is the default value.
    this.yDisplaceDef = this.toolbar.height; //4 * (this.toolbar.height / 5);
    this.yDisplace = this.yDisplaceDef;

    this.xDisplace = 0;
    this.xTween = null;

    // Setting the toolbar in the correct position.
    this.toolbar.y += this.yDisplace;

    // These are the sections of the UI that pertain to walkways.
    this.toolbarWalkway = this._game.add.sprite(0, this.toolbar.y - this.yDisplace, 'buildings', 'ToolbarTabs');
    this.toolbarWalkway.anchor.setTo(.5, 1);
    this.toolbarWalkway.scale.y = .75;

    this._game.UIObjects.add(this.toolbarWalkway);

    // Boolean to test whether or not the player has the toolbar enabled.
    this.menuActive = false;

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
    this.buildingArray = ['BrickMine2x2', 'IceMine2x2', 'Habitation1x1Down', 'Habitation2x1LeftRight', 'Habitation2x2',
        'Storage1x1Down', 'Storage2x2', 'Hydroponics2x2', 'WaterTank2x1', 'WaterRecycler2x1LeftRight',
        'SolarPanel1x1', 'PowerStorage2x1LeftRight', 'LandingPad3x3'
    ];
    this.icons = this._game.add.group();
    this.icons.classType = Phaser.Button;

    this.icons.x = this.camera.x + this.camera.width / 2;
    this.icons.y = this.toolbar.y + this.toolbar.height / 2; //this.camera.y + this.camera.height - this.yDisplaceDef;

    this.scaleFactor = 1.15;

    this.openTag = 'Press E to open Inventory';
    this.closeTag = 'Press E to close Inventory';
    this.tag = this.openTag;

    this.WalkwayLeft = this._game.add.button(0, this.toolbarWalkway.y, 'buildings');
    this.WalkwayLeft.frameName = 'WalkwayStraight';
    this.WalkwayLeft.anchor.setTo(.5, .5);
    this.WalkwayLeft.scale.setTo(.6, .6);
    this.WalkwayLeft.onInputOver.add(this.hoverOver, this, 0, this.WalkwayLeft, this.tag);
    this.WalkwayLeft.onInputOut.add(this.hoverOut, this, 0, this.WalkwayLeft, this.tag);
    this.WalkwayLeft.onInputDown.add(this.makeBuilding, this, 0, this.WalkwayLeft);

    this.WalkwayRight = this._game.add.button(0, this.toolbarWalkway.y, 'buildings');
    this.WalkwayRight.frameName = 'WalkwayCorner';
    this.WalkwayRight.anchor.setTo(.5, .5);
    this.WalkwayRight.scale.setTo(.6, .6);
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

    this.rotateText = this._game.add.text(0, 0, 'Rotate');
    this.rotateText.fontSize = 19;
    this.rotateText.inputEnabled = true;
    this.rotateText.events.onInputDown.add(this.rotBuilding, this);

    this.cancelText = this._game.add.text(0, 0, 'Cancel');
    this.cancelText.fontSize = 19;
    this.cancelText.inputEnabled = true;
    this.cancelText.anchor.setTo(1, 0);
    this.cancelText.events.onInputDown.add(this.canBuilding, this);

    for (let i = 0; i < this.buildingArray.length; i++) {
        let indivIcon = this.icons.create(2 * (i - Math.floor(this.toolbarLength / 2)) * (this.camera.width /
            (this.toolbarLength * 2)), 0, 'buildings');
        indivIcon.frameName = this.buildingArray[i];

        indivIcon.onInputDown.add(this.makeBuilding, this, 0, indivIcon);
        indivIcon.onInputOver.add(this.hoverOver, this, 0, indivIcon, this.tag);
        indivIcon.onInputOut.add(this.hoverOut, this, 0, indivIcon, this.tag);

        indivIcon.y += (this.toolbar.height * this.toolbar.scale.y) / 2;
        indivIcon.anchor.setTo(.5, .5);
        indivIcon.scale.x = (this.toolbar.height * this.toolbar.scale.y) / (indivIcon.width * 1.5);
        indivIcon.scale.y = indivIcon.scale.x;
    }
}

UserInterface.prototype.display = function() {
    if (this._game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
        this.openMenu();
    }

    if (this._game.input.keyboard.justPressed(Phaser.Keyboard.A) && (this.xDisplace < 0) && this.menuActive) {
        if (this.xTween ? !this.xTween.isRunning : true) {
            this.xTween = this._game.add.tween(this).to({
                xDisplace: this.xDisplace + this.camera.width / this.toolbarLength
            }, 215, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    if (this._game.input.keyboard.justPressed(Phaser.Keyboard.D) && (this.xDisplace > -((this.buildingArray.length -
            this.toolbarLength) * this.camera.width) / this.toolbarLength) && this.menuActive) {
        if (this.xTween ? !this.xTween.isRunning : true) {
            this.xTween = this._game.add.tween(this).to({
                xDisplace: this.xDisplace - this.camera.width / this.toolbarLength
            }, 215, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    this.icons.x = this.camera.x + this.camera.width / 2 + this.xDisplace;
    this.icons.y = this.camera.y + this.camera.height - (this.yDisplaceDef - this.yDisplace) + this.toolbar.height /
        8;

    // Setting the toolbar and instruction text in the correct locations.
    this.toolbar.x = this.camera.x + this.camera.width / 2;
    this.toolbar.y = this.camera.y + this.camera.height + this.yDisplace;
    this.toolbarWalkway.x = this.toolbar.x;
    this.toolbarWalkway.y = this.toolbar.y - this.toolbar.height;
    this.instructText.x = this.toolbar.x;
    this.instructText.y = this.toolbar.y - this.toolbar.height;

    this.WalkwayLeft.x = this.toolbarWalkway.x - 10.25 * (this.camera.width / 25); // The number is somewhat arbitrary, but it works.
    this.WalkwayRight.x = this.toolbarWalkway.x + 10.25 * (this.camera.width / 25);
    this.WalkwayLeft.y = this.toolbarWalkway.y - .55 * this.WalkwayLeft.height;
    this.WalkwayRight.y = this.toolbarWalkway.y - .55 * this.WalkwayRight.height;

    if (this.toolbar.input.pointerOver()) {
        this.canDrag = false;
    } else {
        if (this.hovering) {
            this.canDrag = false;
        } else {
            this.canDrag = true;
        }
    }

    this.rotateText.position.x = this.camera.x + 4.5 * (this.camera.width / 7);
    this.rotateText.position.y = this.camera.y + 15.75 * (this.camera.height / 20);

    this.cancelText.position.x = this.camera.x + 2.5 * (this.camera.width / 7);
    this.cancelText.position.y = this.rotateText.y;

    if (this.yTween) {
        if (this.yTween.isRunning || !this.menuActive) {
            this.rotateText.visible = false;
            this.cancelText.visible = false;
        } else {
            this.rotateText.visible = true;
            this.cancelText.visible = true;
        }
    } else if (this.menuActive) {
        this.rotateText.visible = true;
        this.cancelText.visible = true;
    } else {
        this.rotateText.visible = false;
        this.cancelText.visible = false;
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

        //call the building constructor directly through the window (only works on browsers)
        this.buttonBuilding = new window[name](this._game, width, height, 'buildings', frame, buildingParams);

        //if the player has enough resources, purchase the building
        if (this.buttonBuilding && this.buttonBuilding.hasResources()) {
            this.buttonBuilding.x = this._game.input.mousePointer.x;
            this.buttonBuilding.y = this._game.input.mousePointer.y;
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