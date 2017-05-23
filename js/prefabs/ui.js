function UserInterface(game, camera) {
    //Phaser.Group.call(game);
    this.game = game;
    this.camera = camera;

    this.buttonBuilding = null;

    // Determines whether or not the user's cursor is hovering over the toolbar.
    this.canDrag = true;

    // Creates the visual toolbar located at the bottom of the screen.
    this.toolbar = this.game.add.sprite(0, this.camera.y + this.camera.height, 'buildings', 'Toolbar1');
    //this.toolbar.alpha = 0.7;
    this.toolbar.scale.y = .7;
    this.toolbar.anchor.setTo(.5, 1);
    this.toolbar.inputEnabled = true;

    this.game.UIObjects.add(this.toolbar);

    this.toolbarLength = 3;

    // Refers to position of toolbar on screen. DisplaceDef is the default value.
    this.yDisplaceDef = 4 * (this.toolbar.height / 5);
    this.yDisplace = this.yDisplaceDef;

    this.xDisplace = 0;
    this.xTween = null;

    // Setting the toolbar in the correct position.
    this.toolbar.y += this.yDisplace;

    // Boolean to test whether or not the player has the toolbar enabled.
    this.menuActive = false;

    this.buildings = {
        'WalkwayStraight': ['Walkway', 1, 1],
        'WalkwayCorner': ['Walkway', 1, 1],
        'Habitation1x1Down': ['Habitation1x1', 1, 1, 'Habitation1x1Left', 'Habitation1x1Up', 'Habitation1x1Right'],
        'Habitation2x1LeftRight': ['Habitation2x1', 2, 1, 'Habitation2x1UpDown'],
        'Habitation2x2': ['Habitation2x2', 2, 2],
        'Storage1x1Down': ['Storage1x1', 1, 1, 'Storage1x1Left', 'Storage1x1Up', 'Storage1x1Right'],
        'Storage2x2': ['Storage2x2', 2, 2],
        'WaterTank2x1': ['WaterTank2x1', 2, 1],
        'WaterRecycler2x1LeftRight': ['WaterRecycler2x1', 2, 1, 'WaterRecycler2x1UpDown'],
        'LandingPad3x3': ['LandingPad3x3', 3, 3]
    };

    this.buildingArray = ['WalkwayStraight', 'WalkwayCorner', 'Habitation1x1Down', 'Habitation2x1LeftRight',
        'Habitation2x2', 'Storage1x1Down', 'Storage2x2', 'WaterTank2x1', 'WaterRecycler2x1LeftRight',
        'LandingPad3x3'
    ];
    this.icons = this.game.add.group();
    this.icons.classType = Phaser.Button;

    this.icons.x = this.camera.x + this.camera.width / 2;
    this.icons.y = this.toolbar.y; //this.camera.y + this.camera.height - this.yDisplaceDef;

    this.scaleFactor = 1.15;

    this.openTag = 'Press E to open Inventory';
    this.closeTag = 'Press E to close Inventory';
    this.tag = this.openTag;

    // Visual instructions for the toolbar.
    this.instructText = this.game.add.text(0, 0, this.openTag);
    this.instructText.anchor.setTo(.5, -.1);

    //this.instructText.font = 'Comic Sans MS'; LOL NO
    this.instructText.addColor('#01060f', 0);
    this.instructText.fontSize = 19;

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

    //this.icons.align(this.buildingArray.length, 1, 50, 50);
    //this.icons.pivot.x = this.camera.width/2;

}

UserInterface.prototype.display = function() {
    if (this.game.input.keyboard.justPressed(Phaser.Keyboard.E)) {
        // If the menu is not activated, pull it up. Otherwise, close it.
        if (this.menuActive === false) {
            this.game.add.tween(this).to({
                yDisplace: 0
            }, 300, Phaser.Easing.Quadratic.InOut, true);
            this.menuActive = true;
        } else {
            this.game.add.tween(this).to({
                yDisplace: this.yDisplaceDef
            }, 300, Phaser.Easing.Quadratic.InOut, true);
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

    if (this.game.input.keyboard.justPressed(Phaser.Keyboard.A) && (this.xDisplace < 0)) {
        if (this.xTween !== null) {
            this.xTween = this.game.add.tween(this).to({
                xDisplace: this.xDisplace + this.camera.width / this.toolbarLength
            }, 300, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    if (this.game.input.keyboard.justPressed(Phaser.Keyboard.D) && (this.xDisplace > -((this.buildingArray.length -
            this.toolbarLength) * this.camera.width) / this.toolbarLength)) {
        if (this.menuActive) {
            this.xTween = this.game.add.tween(this).to({
                xDisplace: this.xDisplace - this.camera.width / this.toolbarLength
            }, 300, Phaser.Easing.Quadratic.InOut, true);
        }
    }

    this.icons.x = this.camera.x + this.camera.width / 2 + this.xDisplace;
    this.icons.y = this.camera.y + this.camera.height - (this.yDisplaceDef - this.yDisplace);

    // Setting the toolbar and instruction text in the correct locations.
    this.toolbar.x = this.camera.x + this.camera.width / 2;
    this.toolbar.y = this.camera.y + this.camera.height + this.yDisplace;
    this.instructText.x = this.toolbar.x;
    this.instructText.y = this.toolbar.y - this.toolbar.height;

    if (this.toolbar.input.pointerOver()) {
        this.canDrag = false;
    } else {
        this.canDrag = true;
    }
};

UserInterface.prototype.makeBuilding = function(indivIcon) {
    if (!this.game.holdingBuilding) {
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
        let buttonBuilding = new window[name](this.game, width, height, 'buildings', frame, buildingParams);

        //if the player has enough resources, purchase the building
        if (buttonBuilding && buttonBuilding.hasResources()) {
            buttonBuilding.x = this.game.input.mousePointer.x;
            buttonBuilding.y = this.game.input.mousePointer.y;
            buttonBuilding.purchased();
        } else {
            buttonBuilding.destroy();
        }
    }
};

UserInterface.prototype.hoverOver = function(indivIcon) {
    indivIcon.scale.x *= this.scaleFactor;
    indivIcon.scale.y = indivIcon.scale.x;
    let frame = indivIcon.frameName;

    this.tag = frame;
    this.changeTag();
};

UserInterface.prototype.hoverOut = function(indivIcon) {
    indivIcon.scale.x *= (1 / this.scaleFactor);
    indivIcon.scale.y = indivIcon.scale.x;
    this.frame = indivIcon.frameName;

    this.tag = this.closeTag;
    this.changeTag();
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