'use strict';

/*
Play is the state containing the main game loop
*/
var Play = function(game) {
    this.game = game;

    //the scale of the world (changes with zooming)
    this.worldScale = 1;
    this.zoomLevel = 0;
    this.dragSpeed = 4;
    this.worldSize = 4032;
};
Play.prototype = {
    preload: function() {
        //temporary... move to Load state
        this.load.path = 'assets/img/';
        this.load.image('hab1x1', 'Habitation1x1.png');
        this.load.image('hab2x1', 'Habitation2x1.png');
        this.load.image('habBed', 'HabitationBed.png');

        console.log('Play: preload()');
    },
    create: function() {
        console.log('Play: create()');
        this.world.setBounds(0, 0, 4032, 4032);

        this.gameWorld = this.add.group();

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

        //Test building stuff :D
        this.hab1 = new Building(this, 1,  1, 'hab1x1');
        this.hab1.x = 200;
        this.hab1.y = 200;

        this.hab2 = new Building(this, 2, 1, 'hab2x1');
        this.hab2.x = 0;
        this.hab2.y = 0;

        //All objects added to the world will be added to the gameWorld group
        //Then, that is what will be scaled on zoom, instead of the whole world
        //I can potentially put this into the building constructors...
        this.gameWorld.add(this.hab1);
        this.gameWorld.add(this.hab2);
    },
    update: function() {
        //move the camera as the mouse goes to the sides of the screen
        //also scroll the background grid at the same frequency
        if (this.input.activePointer.withinGame) {
            var oldCameraPosX = this.camera.x;
            var oldCameraPosY = this.camera.y;
            if (this.input.x > this.camera.view.width - 50) {
                this.camera.x += this.dragSpeed;
                this.g.gridsSpr[this.zoomLevel].tilePosition.x -= Math.abs(this.camera.x - oldCameraPosX);
            }
            if (this.input.x < 50) {
                this.camera.x -= this.dragSpeed;
                this.g.gridsSpr[this.zoomLevel].tilePosition.x += Math.abs(this.camera.x - oldCameraPosX);
            }
            if (this.input.y > this.camera.view.height - 50) {
                this.camera.y += this.dragSpeed;
                this.g.gridsSpr[this.zoomLevel].tilePosition.y -= Math.abs(this.camera.y - oldCameraPosY);
            }
            if (this.input.y < 50) {
                this.camera.y -= this.dragSpeed;
                this.g.gridsSpr[this.zoomLevel].tilePosition.y += Math.abs(this.camera.y - oldCameraPosY);
            }
        }

        //keep the grid tileSprite centered on the camera
        this.g.gridsSpr[this.zoomLevel].x = this.camera.x;
        this.g.gridsSpr[this.zoomLevel].y = this.camera.y;
    },
    render: function() {
        //game.debug.cameraInfo(this.camera, 2, 14, '#ffffff');
        //game.time.advancedTiming=true;
        //game.debug.text(game.time.fps || '--',2,14,'#ffffff');
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
            var focalMult = this.worldScale===1.5?1.5:1.35;
            this.camera.focusOnXY((this.camera.view.centerX + offsetX) * focalMult, 
                (this.camera.view.centerY + offsetY) * focalMult);

            //Move the grid by the amount the camera moved in the opposite direction
            if (oldCameraPosX !== this.camera.x || oldCameraPosY !== this.camera.y) {
                this.g.gridsSpr[this.zoomLevel].tilePosition.x -= Math.abs(this.camera.x - oldCameraPosX);
                this.g.gridsSpr[this.zoomLevel].tilePosition.y -= Math.abs(this.camera.y - oldCameraPosY);
            }

            //move to the next zoom level and copy the tile position to the next grid
            this.zoomLevel++;
            this.g.gridsSpr[this.zoomLevel].tilePosition = this.g.gridsSpr[this.zoomLevel - 1].tilePosition;

            //Make the new grid visible
            this.g.gridsSpr[this.zoomLevel].revive();

            //Acutally scale all scalable objects
            this.gameWorld.scale.set(this.worldScale);
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
            var focalMult = this.worldScale===1.5?1.35:1.5;
            this.camera.focusOnXY(this.camera.view.centerX / focalMult, this.camera.view.centerY / focalMult);

            //move the grid by the amount the camera moved in the opposite direction
            if (oldCameraPosX !== this.camera.x || oldCameraPosY !== this.camera.y) {
                this.g.gridsSpr[this.zoomLevel].tilePosition.x += Math.abs(this.camera.x - oldCameraPosX);
                this.g.gridsSpr[this.zoomLevel].tilePosition.y += Math.abs(this.camera.y - oldCameraPosY);
            }

            //Make the new grid visible
            this.g.gridsSpr[this.zoomLevel].revive();

            //Acutally scale all scalable objects
            this.gameWorld.scale.set(this.worldScale);
        }
    }
};