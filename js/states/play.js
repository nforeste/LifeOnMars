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
    hasLandingPad: false,
    newPeople: 5,
    waterDecayRate: 0,
    foodDecayRate: 0,

    preload: function() {
        //temporary... move to Load state
        this.load.path = 'assets/img/';
        this.load.tilemap('test', 'test.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('terrain', 'terrain.png');
        this.load.atlas('buildings', 'inProgressAtlas.png', 'inProgressAtlas.json');
        this.load.image('arrow', 'Arrow_Left.png');
        this.load.image('toolbar', 'New_UI.png');
        this.load.image('rotateButton', 'RotateButton.png');
        this.load.image('cancelButton', 'CancelButton.png');
        this.load.image('mars', 'TimerMars.png');
        this.load.image('earth', 'TimerEarth.png');
        this.load.image('rocket', 'TimerShip.png');
        this.load.image('stopwatch', 'Stopwatch.png');
        this.load.image('topBar', 'New_Top.png');
        this.load.image('conBar', 'ConstructionBar.png');
        console.log('Play: preload()');
    },
    create: function() {
        console.log('Play: create()');
        this.world.setBounds(0, 0, 4032, 4032);

        //set all of the play state variables
        this.newPeople = 5;
        this.holdingBuilding = null;
        this.hasLandingPad = false;
        this.worldScale = 1;
        this.worldSize = 4032;
        this.zoomLevel = 0;
        this.scrollSpeed = 4;

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

        this.game.buildCount = [
            0, //[0]-Command
            0, //[1]-habitation 2x2
            0, //[2]-habitation 2x1
            0, //[3]-habitation 1x1
            0, //[4]-Water tank
            0, //[5]-water recycle
            0, //[6]-power storage
            0, //[7]-solar pannel
            0, //[8]-hydroponics
            0, //[9]-storage 1x1
            0, //[10]-storage 2x2
            0, //[11]-brickmine
            0 //[12]-icemine
        ];

        //initiates the UI
        this.UI = new UserInterface(this, this.camera);

        this.resources = {
            water: new Resource(this, 50, 50, 350, 32, 'buildings', 'WaterIcon'),
            food: new Resource(this, 50, 50, 445, 32, 'buildings', 'FoodIcon'),
            house: new Resource(this, 5, 5, 540, 32, 'buildings', 'HousingIcon'),
            power: new Resource(this, 20, 20, 635, 32, 'buildings', 'PowerIcon'),
            mat: new Resource(this, 150, 150, 730, 32, 'buildings', 'BrickIcon')
        };

        //initiates the population update timer
        this.gameTimer = new Timer(this, 0, 0, 24, 32, 'stopwatch');

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

        //When the player presses 'F' (or a button on the UI)
        //the camera should focus on the command center
        let focus = this.input.keyboard.addKey(Phaser.Keyboard.F);
        focus.onDown.add(() => {
            this.focusOnCommand();
        }, this);

        //game loop that decreases food and water over time based on population
        //delay is arbitrary right now ... needs testing
        this.waterDecayRate = 3500;
        this.time.events.loop(this.waterDecayRate / Math.log(this.resources.house.currentAmount), function() {
            this.resources.water.subtract(1);
        }, this);

        this.foodDecayRate = 4500;
        this.time.events.loop(this.foodDecayRate / Math.log(this.resources.house.currentAmount), function() {
            this.resources.food.subtract(1);
        }, this);

        //get the x and y position to place the starting command center
        //they will be random at least 500 px from the world edge
        do {
            var xPos = this.rnd.integerInRange(500, this.world.width - 500);
            xPos -= xPos % 32;
            var yPos = this.rnd.integerInRange(500, this.world.height - 500);
            yPos -= yPos % 32;

            var goodPlacement = true;
            for (let i = (xPos / 32) - 1; i < (xPos / 32) + 4; i++) {
                for (let j = (yPos / 32) - 1; j < (yPos / 32) + 4; j++) {
                    if (this.g.cells[i][j].tile === 'water' || this.g.cells[i][j].tile === 'iron') {
                        goodPlacement = false;
                    }
                }
            }
        } while (!goodPlacement);

        //build the starting command center and place it on the location
        this.commandCenter = new CommandCenter(this, 3, 3, 'buildings', 'CommandCenter3x3');
        this.commandCenter.place(xPos / 32, yPos / 32);

        this.commandPos = this.commandCenter.position.clone();
        this.focusOnCommand(1);

        let c = this.g.cells;

        //pick a random tile to place water on near the command center (keep searching until clean square)
        do {
            var waterPosX = Math.round(Math.random()) ? this.rnd.integerInRange((xPos / 32) - 11, xPos / 32 - 5) :
                this.rnd.integerInRange((xPos / 32) + 4, (xPos / 32) + 10);

            var waterPosY = Math.round(Math.random()) ? this.rnd.integerInRange((yPos / 32) - 9, (yPos / 32) -
                4) : this.rnd.integerInRange((yPos / 32) + 4, (yPos / 32) + 7);
        } while (c[waterPosX + 1][waterPosY].tile || c[waterPosX][waterPosY + 1].tile ||
            c[waterPosX + 2][waterPosY + 1].tile || c[waterPosX + 1][waterPosY + 2].tile);

        //pick a random tile to place bricks on near the command center (keep searching until clean square)
        do {
            var brickPosX = Math.round(Math.random()) ? this.rnd.integerInRange((xPos / 32) - 11, xPos / 32 - 5) :
                this.rnd.integerInRange((xPos / 32) + 4, (xPos / 32) + 10);

            var brickPosY = Math.round(Math.random()) ? this.rnd.integerInRange((yPos / 32) - 9, (yPos / 32) -
                4) : this.rnd.integerInRange((yPos / 32) + 4, (yPos / 32) + 7);
        } while (c[brickPosX][brickPosY].tile || c[brickPosX][brickPosY + 1].tile ||
            c[brickPosX + 2][brickPosY + 1].tile || c[brickPosX + 1][brickPosY + 2].tile);

        //populate the 3x3 square around the tile with water
        for (let i = waterPosX; i < waterPosX + 3; i++) {
            for (let j = waterPosY; j < waterPosY + 3; j++) {
                let random = Math.floor(Math.random() * (this.gen.waterTiles.length + 1));
                if (random < this.gen.waterTiles.length) {
                    if (this.g.cells[i][j].tile) {
                        continue;
                    }
                    this.gen.tilemap.putTile(this.gen.waterTiles[random], i, j, this.gen.layer1);
                    this.g.cells[i][j].tile = 'water';
                }
            }
        }

        //populate the 3x3 square around the tile with bricks
        for (let i = brickPosX; i < brickPosX + 3; i++) {
            for (let j = brickPosY; j < brickPosY + 3; j++) {
                let random = Math.floor(Math.random() * (this.gen.ironTiles.length + 1));
                if (random < this.gen.ironTiles.length) {
                    this.gen.tilemap.putTile(this.gen.ironTiles[random], i, j, this.gen.layer1);
                    this.g.cells[i][j].tile = 'iron';
                }
            }
        }
    },
    update: function() {
        //Move the camera by dragging the game world
        var oldCameraPosX = this.camera.x;
        var oldCameraPosY = this.camera.y;

        //move the camera as the mouse goes to the sides of the screen
        //also scroll the background grid at the same frequency
        //if the user is holding down the mouse
        if (this.input.activePointer.withinGame) {
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
        //game.debug.geom(rect, 'rgba(255,0,0,1)');
    },
    peopleArrive: function() {
        let style = {
            fill: '#fff',
            font: '64px Helvetica Neue'
        };

        //create text, centered and fixed to camera, at 1/4 scale
        let text = this.add.text(this.camera.width / 2, 100, this.newPeople +
            ' more people arriving', style);
        text.fixedToCamera = true;
        text.anchor.set(.5);
        text.scale.set(.25);

        //tween the text larger
        this.add.tween(text.scale).to({
            x: 1,
            y: 1
        }, 1500, 'Linear', true, 0, -1, true);

        console.log(this.newPeople);

        //check to make sure the player has enough housing to support the new people
        if (this.resources.house.storage < this.resources.house.currentAmount + this.newPeople) {
            this.game.backMusic2.stop();
            this.state.start('GameOver');
            //Do game over stuff here?
        }

        //add more people and resources
        this.resources.house.add(this.newPeople);

        if (this.hasLandingPad) {
            this.resources.mat.add(Math.max(this.newPeople * 2, 20));
            this.resources.water.add(Math.ceil(this.newPeople / 2));
            this.resources.food.add(Math.ceil(this.newPeople / 2));
        } else {
            this.resources.mat.add(Math.max(this.newPeople, 20));
        }
        this.newPeople *= 2;
        this.game.arriveMusic.play('', 0, 0.5, false, true);
        this.game.arriveMusic.fadeOut(5000);

        //destroy the text (delete it)
        this.time.events.add(3000, function() {
            text.destroy();
        });
    },
    focusOnCommand: function(frames) {
        let distToCommandX = (this.commandPos.x + 48) - this.camera.view.centerX;
        let distToCommandY = (this.commandPos.y + 48) - this.camera.view.centerY;

        let farther = Math.max(Math.abs(distToCommandX), Math.abs(distToCommandY));
        frames = frames || Math.round(farther / (100 * this.worldScale));

        if (frames < 1) {
            return;
        }

        let travelFrameX = Math.round(distToCommandX / frames);
        let travelFrameY = Math.round(distToCommandY / frames);

        this.time.events.repeat(10, frames, () => {
            let oldCameraPosX = this.camera.x;
            let oldCameraPosY = this.camera.y;

            this.camera.x += travelFrameX;
            this.camera.y += travelFrameY;

            //move the grid tileSprite so that it stays correct with the adjusted camera
            this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
            this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;
        }, this);
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
            if (this.UI.buttonBuilding ? this.UI.buttonBuilding instanceof Walkway : false) {
                if (this.input.y < this.camera.view.height - this.panDistance) {
                    this.camera.x += this.scrollSpeed;
                }
            } else {
                this.camera.x += this.scrollSpeed;
            }
        }

        if (this.input.x < this.panDistance) {
            if (this.UI.buttonBuilding ? this.UI.buttonBuilding instanceof Walkway : false) {
                if (this.input.y < this.camera.view.height - this.panDistance) {
                    this.camera.x -= this.scrollSpeed;
                }
            } else {
                this.camera.x -= this.scrollSpeed;
            }
        }

        if (this.input.y > this.camera.view.height - this.panDistance && this.UI.canScroll) {
            if (this.UI.buttonBuilding ? this.UI.buttonBuilding instanceof Walkway : false) {
                if (!(this.input.x < this.panDistance) && !(this.input.x > this.camera.view.width - this.panDistance)) {
                    this.camera.y += this.scrollSpeed;
                }
            } else {
                this.camera.y += this.scrollSpeed;
            }
        }

        if (this.input.y < this.panDistance) {
            this.camera.y -= this.scrollSpeed;
        }
    },
    zoomIn: function(zoomButton) {
        if (this.worldScale < 2) {
            this.game.zoomMusic.play('', 0, 0.5, false, true);

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
            var offsetX = Math.round((this.input.x - (this.camera.width / 2)) /
                (this.camera.width / 250));
            var offsetY = Math.round((this.input.y - (this.camera.height / 2)) /
                (this.camera.height / 250));

            //arbitrary, looks pretty good though
            var focalMult = this.worldScale === 1.5 ? 1.5 : 1.35;

            if (zoomButton) {
                this.camera.focusOnXY(this.camera.view.centerX * focalMult,
                    this.camera.view.centerY * focalMult);
            } else {
                this.camera.focusOnXY((this.camera.view.centerX + offsetX) * focalMult,
                    (this.camera.view.centerY + offsetY) * focalMult);
            }

            //Move the grid by the amount the camera moved in the opposite direction
            this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
            this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;

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

            //update the command center's position
            this.commandPos.x = this.commandCenter.x * this.worldScale;
            this.commandPos.y = this.commandCenter.y * this.worldScale;
        }
    },
    zoomOut: function() {
        if (this.worldScale > 1) {
            this.game.zoomMusic.play('', 0, 0.5, false, true);
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
            this.g.gridsSpr[this.zoomLevel].tilePosition.x += oldCameraPosX - this.camera.x;
            this.g.gridsSpr[this.zoomLevel].tilePosition.y += oldCameraPosY - this.camera.y;

            //Make the new grid visible
            this.g.gridsSpr[this.zoomLevel].revive();

            //Acutally scale all scalable objects
            this.gameObjects.scale.set(this.worldScale);
            this.gen.layer1.scale.set(this.worldScale);

            if (this.holdingBuilding) {
                this.holdingBuilding.scale.set(this.worldScale / 2);
            }

            //update the command center's position
            this.commandPos.x = this.commandCenter.x * this.worldScale;
            this.commandPos.y = this.commandCenter.y * this.worldScale;
        }
    }
};