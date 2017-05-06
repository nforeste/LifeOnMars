'use strict';

/*
Play is the state containing the main game loop
*/

var Play = function(game) {
    this.game = game;

    //the scale of the world (changes with zooming)
    this.worldScale = 1;
    this.zoomLevel = 0;
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
        this.input.mouse.mouseWheelCallback = this.zoom.bind(this);

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
            if (this.input.x > this.camera.view.width - 50) {
                if (this.camera.x + this.camera.view.width < this.world.width) {
                    this.g.gridsSpr[this.zoomLevel].tilePosition.x -= 4;
                }
                this.camera.x += 4;
            }
            if (this.input.x < 50) {
                if (this.camera.x > 0) {
                    this.g.gridsSpr[this.zoomLevel].tilePosition.x += 4;
                }
                this.camera.x -= 4;
            }
            if (this.input.y > this.camera.view.height - 50) {
                if (this.camera.y + this.camera.view.height < this.world.height) {
                    this.g.gridsSpr[this.zoomLevel].tilePosition.y -= 4;
                }
                this.camera.y += 4;
            }
            if (this.input.y < 50) {
                if (this.camera.y > 0) {
                    this.g.gridsSpr[this.zoomLevel].tilePosition.y += 4;
                }
                this.camera.y -= 4;
            }
        }

        //keep the grid tileSprite centered on the camera
        this.g.gridsSpr[this.zoomLevel].x = this.camera.view.x;
        this.g.gridsSpr[this.zoomLevel].y = this.camera.view.y;
    },
    render: function() {
        //game.debug.text(game.input.activePointer.position, 2, 14, '#ffffff');
        //game.debug.cameraInfo(this.camera, 2, 64, '#ffffff');
    },
    zoom: function() {
        //keep track of the previous zoom
        var oldScale = this.worldScale;
        var oldZoom = this.zoomLevel;

        //move the scale up and down based on the mousewheel
        if (this.input.mouse.wheelDelta === Phaser.Mouse.WHEEL_UP) {
            this.worldScale += .5;
            this.zoomLevel++;
        } else {
            this.worldScale -= .5;
            this.zoomLevel--;
        }

        // this.gameWorld.pivot.set(this.input.worldX, this.input.worldY);
        // this.gameWorld.x = this.input.worldX;
        // this.gameWorld.y = this.input.worldY;

        //clamp the scaling (arbitrary right now)
        this.worldScale = Phaser.Math.clamp(this.worldScale, 1, 2);
        this.zoomLevel = Phaser.Math.clamp(this.zoomLevel, 0, 2);
        this.gameWorld.scale.set(this.worldScale);

        //if the scale changed, replace the grid with the new zoom
        //Can't just increase grid scale because it will make the line width thicker
        if (oldScale !== this.worldScale) {
            this.g.bmdOverlay.clear();
            this.g.gridsSpr[oldZoom].kill();
            this.g.gridsSpr[this.zoomLevel].tilePosition = this.g.gridsSpr[oldZoom].tilePosition;
            this.g.gridsSpr[this.zoomLevel].revive();

            //this.g.gridsSpr[this.zoomLevel].tilePosition.x = this.input.worldX;
            //this.g.gridsSpr[this.zoomLevel].tilePosition.y = this.input.worldY;
        }
    }
};