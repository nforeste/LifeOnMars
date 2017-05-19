'use strict';

/*
Play is the state containing the main game loop
*/

var Play = function(game) {
    this.game = game;

    //the scale of the world (changes with zooming)
    this.worldScale = 1;
    this.zoomLevel = 0;
    this.scrollSpeed = 4;
    this.worldSize = 4032;
    this.holdingBuilding = null;
};
Play.prototype = {
    preload: function() {
        //temporary... move to Load state
        this.load.path = 'assets/img/';
        // this.load.image('hab1x1Down', 'HabitationUnit1x1Down.png');
        // this.load.image('hab1x1Left', 'HabitationUnit1x1Left.png');
        // this.load.image('hab1x1Up', 'HabitationUnit1x1Up.png');
        // this.load.image('hab1x1Right', 'HabitationUnit1x1Right.png');
        // this.load.image('hab2x1LeftRight', 'HabitationUnit2x1LeftRight.png');
        // this.load.image('hab2x1UpDown', 'HabitationUnit2x1UpDown.png');
        // this.load.image('commandCenter', 'CommandCenter3x3.png');
        // this.load.image('walkStraight', 'WalkwayStraight.png');
        // this.load.image('walkT', 'WalkwayTShape.png');
        // this.load.image('walkCross', 'WalkwayCross.png');
        // this.load.image('hab2x2', 'HabitationUnit2x2.png');
        this.load.atlas('buildings', 'inProgressAtlas.png', 'inProgressAtlas.json');

        console.log('Play: preload()');
    },
    create: function() {
        console.log('Play: create()');
        this.world.setBounds(0, 0, 4032, 4032);

        //orangish brown
        this.stage.backgroundColor = '#c1440e';
        this.g = new Grid(this, 32, 32, 'black');
        this.g.makeGrid();

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


        this.allObjects = this.add.group();
        //parent group of every gameObject
        this.gameObjects = this.add.group();
        //this.gameObjectsWithUI = this.add.group();
        this.UIObjects = this.add.group();

        this.allObjects.add(this.gameObjects);
        this.allObjects.add(this.UIObjects);

        this.waterRes = new Resource(this, 0, 10, 360, 0, 'buildings', 'WaterIcon');
        this.foodRes = new Resource(this, 0, 10, 440, 0, 'buildings', 'WaterIcon'); //swap out the sprites when they get made
        this.houseRes = new Resource(this, 0, 10, 520, 0, 'buildings', 'HousingIcon');
        this.powerRes = new Resource(this, 0, 10, 600, 0, 'buildings', 'PowerIcon');
        this.materialRes = new Resource(this, 0, 10, 680, 0, 'buildings', 'WaterIcon');

        //initiates the UI
        this.UI = new UserInterface(this, this.camera);

        //get the x and y position to place the starting command center
        //they will be random at least 500 px from the world edge
        let xPos = this.rnd.integerInRange(500, this.world.width - 500);
        xPos -= xPos % 32;
        let yPos = this.rnd.integerInRange(500, this.world.height - 500);
        yPos -= yPos % 32;

        //build the starting command center and place it on the location
        let commandCenter = new CommandCenter(this, 3, 3, 'buildings', 'CommandCenter3x3');
        commandCenter.x = xPos;
        commandCenter.y = yPos;
        commandCenter.placed(xPos / 32, yPos / 32);

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

        if (this.UI.buttonBuilding !== null) {
            if (this.UI.buttonBuilding.placed) {
                this.gameObjects.bringToTop(this.UI.toolbar);
            }
        }
    },
    render: function() {
        //game.debug.cameraInfo(this.camera, 2, 14, '#ffffff');
        //game.time.advancedTiming=true;
        //game.debug.text(game.time.fps || '--',2,14,'#ffffff');
    },
    dragCam: function() {
        if (this.input.activePointer.isDown) {
            if (this.origDragPoint) {
                var moveX = Math.round(this.origDragPoint.x - this.input.x);
                var moveY = Math.round(this.origDragPoint.y - this.input.y);

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
        if (this.UI.menuActive) {
            this.panDistance = 30;
        } else {
            this.panDistance = 100;
        }

        if (this.input.x > this.camera.view.width - 100) {
            this.camera.x += this.scrollSpeed;
        }
        if (this.input.x < 100) {
            this.camera.x -= this.scrollSpeed;
        }
        if (this.input.y > this.camera.view.height - this.panDistance) {
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
            var offsetX = Math.round((this.input.x - (this.camera.width / 2)) / (this.camera.width / 250));
            var offsetY = Math.round((this.input.y - (this.camera.height / 2)) / (this.camera.height / 250));

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
            if (this.holdingBuilding) {
                this.holdingBuilding.scale.set(this.worldScale / 2);
            }

            //this.gameObjects.forEach(this.setScale, this, true, this.child);

            //console.log(this.allObjects);
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
            this.camera.focusOnXY(this.camera.view.centerX / focalMult, this.camera.view.centerY / focalMult);

            //move the grid by the amount the camera moved in the opposite direction
            if (oldCameraPosX !== this.camera.x || oldCameraPosY !== this.camera.y) {
                this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
                this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;
            }

            //Make the new grid visible
            this.g.gridsSpr[this.zoomLevel].revive();

            //Acutally scale all scalable objects
            this.gameObjects.scale.set(this.worldScale);
            if (this.holdingBuilding) {
                this.holdingBuilding.scale.set(this.worldScale / 2);
            }

            //this.gameObjects.forEach(this.setScale, this, true, this.child);
        }
    }
};