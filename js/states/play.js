'use strict';

/*
Play is the state containing the main game loop
*/

var Play = function(game) {
    this.game = game;
};
Play.prototype = {
    //the scale of the world (changes with zooming)
    worldScale: 1,
    zoomLevel: 0,
    scrollSpeed: 4,
    worldSize: 4032,
    holdingBuilding: null,
    newPeople: 5,

    preload: function() {
        //temporary... move to Load state
        this.load.path = 'assets/img/';
        this.load.tilemap('test', 'test.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('terrain', 'terrain.png');
        this.load.atlas('buildings', 'inProgressAtlas.png', 'inProgressAtlas.json');
        this.load.image('toolbarTabs', 'ToolbarTabs.png');
        this.load.image('arrow', 'Arrow_Left.png');
        this.load.image('toolbar', 'New_UI.png');
        this.load.image('rotateButton', 'RotateButton.png');
        this.load.image('cancelButton', 'CancelButton.png');

        console.log('Play: preload()');
    },
    create: function() {
        console.log('Play: create()');
        this.world.setBounds(0, 0, 4032, 4032);

        //orangish brown
        this.stage.backgroundColor = '#b66a14';

        this.gen = new Generate(this);
        this.gen.run();

        this.g = new Grid(this, 32, 32, 'black');
        this.g.makeGrid();

        this.allObjects = this.add.group();
        //parent group of every gameObject
        this.gameObjects = this.add.group();
        //group containing all of the storage buildings (with animated frames)
        this.storageBuildings = this.add.group();
        this.gameObjects.add(this.storageBuildings);

        this.UIObjects = this.add.group();

        this.allObjects.add(this.gameObjects);
        this.allObjects.add(this.UIObjects);

        this.resources = {
            water: new Resource(this, 50, 50, 350, 32, 'buildings', 'WaterIcon'),
            food: new Resource(this, 50, 50, 445, 32, 'buildings', 'FoodIcon'),
            house: new Resource(this, 5, 5, 540, 32, 'buildings', 'HousingIcon'),
            power: new Resource(this, 5, 5, 635, 32, 'buildings', 'PowerIcon'),
            mat: new Resource(this, 150, 150, 730, 32, 'buildings', 'BrickIcon')
        };

        //initiates the UI
        this.UI = new UserInterface(this, this.camera);

        //initiates the population update timer
        this.gameTimer = new Timer(this, 0, 0, 24, 32, 'buildings', 'WaterIcon');

        //.bind(this) used to access 'this' scope within callback
        this.input.mouse.mouseWheelCallback = function(event) {
            event.preventDefault();

            //wheelDelta is 1 for wheel up and -1 for wheel down
            if (this.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        }.bind(this);

        //game loop that decreases food and water over time based on population
        //delay is arbitrary right now ... needs testing
        this.time.events.loop(5000 / Math.log(this.resources.house.currentAmount), function() {
            this.resources.food.subtract(1);
            this.resources.water.subtract(1);
        }, this);

        //get the x and y position to place the starting command center
        //they will be random at least 500 px from the world edge
        do {
            var xPos = this.rnd.integerInRange(500, this.world.width - 500);
            xPos -= xPos % 32;
            var yPos = this.rnd.integerInRange(500, this.world.height - 500);
            yPos -= yPos % 32;

            var cell = this.g.cells[xPos / 32][yPos / 32];
        } while (cell.tile === 'water' || cell.tile === 'iron');

        //build the starting command center and place it on the location
        let commandCenter = new CommandCenter(this, 3, 3, 'buildings', 'CommandCenter3x3');
        commandCenter.x = xPos;
        commandCenter.y = yPos;
        commandCenter.place(xPos / 32, yPos / 32);

        //store the old camera position and move the camera to focus on the command center
        let oldCameraPosX = this.camera.x;
        let oldCameraPosY = this.camera.y;
        this.camera.focusOnXY(xPos + 48, yPos + 48);

        //move the grid tileSprite so that it stays correct with the adjusted camera
        this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
        this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;
    },
    update: function() {

        //Move the camera by dragging the game world
        var oldCameraPosX = this.camera.x;
        var oldCameraPosY = this.camera.y;

        //move the camera as the mouse goes to the sides of the screen
        //also scroll the background grid at the same frequency
        if (this.input.activePointer.withinGame) {
            //if the user is holding down the mouse
            if (this.holdingBuilding) {
                this.panCam();
            } else if (this.UI.canDrag) {
                this.dragCam();
            }
        }

        this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
        this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;

        //keep the grid tileSprite centered on the camera
        this.g.gridsSpr[this.zoomLevel].x = this.camera.view.x;
        this.g.gridsSpr[this.zoomLevel].y = this.camera.view.y;

        this.UI.display();
    },
    render: function() {
        //game.debug.cameraInfo(this.camera, 2, 14, '#ffffff');
        //game.time.advancedTiming=true;
        //game.debug.text(game.time.fps || '--',2,14,'#ffffff');
    },
    peopleArrive: function() {
        let style = {
            fill: '#fff',
            font: '64px Helvetica Neue'
        };

        //create text, centered and fixed to camera, at 1/4 scale
        let text = this.add.text(this.camera.width / 2, 100, this.newPeople + ' more people arriving',
            style);
        text.fixedToCamera = true;
        text.anchor.set(.5);
        text.scale.set(.25);

        //tween the text larger
        this.add.tween(text.scale).to({
            x: 1,
            y: 1
        }, 1500, 'Linear', true, 0, -1, true);

        //check to make sure the player has enough housing to support the new people
        if (this.resources.house.storage < this.resources.house.currentAmount + this.newPeople) {
            console.log('YOU LOSE BITCH');
            this.game.backMusic2.stop();
            this.state.start('GameOver');
            //Do game over stuff here?
        }

        //add more people
        this.resources.house.add(this.newPeople);
        this.newPeople *= 2;

        //destroy the text (delete it)
        this.time.events.add(3000, function() {
            text.destroy();
        });
    },
    dragCam: function() {
        if (this.input.activePointer.isDown) {
            if (this.origDragPoint) {
                var moveX = Math.floor(this.origDragPoint.x - this.input.x);
                var moveY = Math.floor(this.origDragPoint.y - this.input.y);

                this.camera.x += moveX;
                this.camera.y += moveY;
            }
            this.origDragPoint = this.input.activePointer.position.clone();
        } else {
            this.origDragPoint = null;
        }
    },
    panCam: function() {
        // I added this to better suit the UI. If the menu is active, then 
        // the user's cursor has to be closer to the bottom of the screen
        // for the camera to scroll, to avoid accidentally scrolling downward
        // while placing a building.
        if (this.UI.menuActive || this.UI.hovering) {
            this.panDistance = 30;
        } else {
            this.panDistance = 100;
        }

        if (this.input.x > this.camera.view.width - this.panDistance) {
            this.camera.x += this.scrollSpeed;
        }
        if (this.input.x < this.panDistance) {
            this.camera.x -= this.scrollSpeed;
        }
        if (this.input.y > this.camera.view.height - this.panDistance && !this.UI.hovering) {
            this.camera.y += this.scrollSpeed;
        }
        if (this.input.y < 100) {
            this.camera.y -= this.scrollSpeed;
        }
    },
    zoomIn: function() {
        if (this.worldScale < 2) {
            //store the current camera position
            var oldCameraPosX = this.camera.x;
            var oldCameraPosY = this.camera.y;

            //increase the world scale by a factor of 50%
            this.worldScale += .5;

            //Increase the size of the world by 50%
            this.world.setBounds(0, 0, this.worldSize * this.worldScale, this.worldSize * this.worldScale);

            //Clear the grid overlay and kill the current grid layer
            this.g.bmdOverlay.clear();
            this.g.gridsSpr[this.zoomLevel].kill();

            //move the camera slightly towards the mouse from the center of the screen
            var offsetX = Math.round((this.input.x - (this.camera.width / 2)) / (this.camera.width /
                250));
            var offsetY = Math.round((this.input.y - (this.camera.height / 2)) / (this.camera.height /
                250));

            //arbitrary, looks pretty good though
            var focalMult = this.worldScale === 1.5 ? 1.5 : 1.35;
            this.camera.focusOnXY((this.camera.view.centerX + offsetX) * focalMult,
                (this.camera.view.centerY + offsetY) * focalMult);

            //Move the grid by the amount the camera moved in the opposite direction
            if (oldCameraPosX !== this.camera.x || oldCameraPosY !== this.camera.y) {
                this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
                this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;
            }

            //move to the next zoom level and copy the tile position to the next grid
            this.zoomLevel++;
            this.g.gridsSpr[this.zoomLevel].tilePosition = this.g.gridsSpr[this.zoomLevel - 1].tilePosition;

            //Make the new grid visible
            this.g.gridsSpr[this.zoomLevel].revive();

            //Acutally scale all scalable objects
            this.gameObjects.scale.set(this.worldScale);
            this.gen.layer1.scale.set(this.worldScale);

            if (this.holdingBuilding) {
                this.holdingBuilding.scale.set(this.worldScale / 2);
            }
        }
    },
    zoomOut: function() {
        if (this.worldScale > 1) {
            //store the current camera position
            var oldCameraPosX = this.camera.x;
            var oldCameraPosY = this.camera.y;

            //decrease the world scale by a factor of 50%
            this.worldScale -= .5;

            //decrease the size of the world by 50%
            this.world.setBounds(0, 0, this.worldSize * this.worldScale, this.worldSize * this.worldScale);

            //clear the current grid
            this.g.bmdOverlay.clear();
            this.g.gridsSpr[this.zoomLevel].kill();
            this.zoomLevel--;

            //arbitrary right now, looks ok though
            var focalMult = this.worldScale === 1.5 ? 1.35 : 1.5;
            this.camera.focusOnXY(this.camera.view.centerX / focalMult, this.camera.view.centerY /
                focalMult);

            //move the grid by the amount the camera moved in the opposite direction
            if (oldCameraPosX !== this.camera.x || oldCameraPosY !== this.camera.y) {
                this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
                this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;
            }

            //Make the new grid visible
            this.g.gridsSpr[this.zoomLevel].revive();

            //Acutally scale all scalable objects
            this.gameObjects.scale.set(this.worldScale);
            this.gen.layer1.scale.set(this.worldScale);

            if (this.holdingBuilding) {
                this.holdingBuilding.scale.set(this.worldScale / 2);
            }
        }
    }
};