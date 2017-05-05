'use strict';

function Grid(game, w, h, lineC) {
    this.game = game;
    this.w = w;
    this.h = h;

    //bmdGrid is the bitmapData that draws the grid on the screen
    this.bmdGrid = game.add.bitmapData(game.world.width, game.world.height);
    this.bmdGrid.ctx.strokeStyle = lineC;

    //lineWidth was going to be an argument, but it broke everything :/
    this.bmdGrid.ctx.lineWidth = 1;

    //create a 2-Dimensional matrix to represent the grid
    //this will be used for terrain (cells[3][4] is a mountain)
    this.cells = [];
    for (let i = 0; i < game.world.width / w; i++) {
        this.cells[i] = [];
    }

    //bmdOverlay is the bitmapData that draws the highlights on the grid
    this.bmdOverlay = game.add.bitmapData(game.world.width, game.world.height);
    this.sprite = game.add.sprite(0, 0, this.bmdOverlay);
    game.add.sprite(0, 0, this.bmdGrid);

    this.index1 = -1;
    this.index2 = -1;
}

//Draws the grid on screen 
Grid.prototype.makeGrid = function() {
    for (let i = 0; i < this.game.world.width; i += this.w) {
        this.bmdGrid.ctx.moveTo(i, 0);
        this.bmdGrid.ctx.lineTo(i, this.game.world.height);
        this.bmdGrid.ctx.stroke();
    }

    for (let i = 0; i < this.game.world.height; i += this.h) {
        this.bmdGrid.ctx.moveTo(0, i);
        this.bmdGrid.ctx.lineTo(this.game.world.width, i);
        this.bmdGrid.ctx.stroke();
    }
};

Grid.prototype.draw = function(xTiles, yTiles, opacity) {
    var curW = this.w * this.game.worldScale;
    var curH = this.h * this.game.worldScale;
    this.upperLeftRow = Math.ceil(this.game.camera.view.x / curW);
    this.upperLeftColumn = Math.ceil(this.game.camera.view.y / curH);
    this.offsetx = this.game.camera.view.x % curW;
    this.offsety = this.game.camera.view.y % curH;

    //change the opacity of the overlay
    this.bmdOverlay.ctx.globalAlpha = opacity;

    if (this.index1 >= 0 && this.index2 >= 0) {
        for (let i = this.xStart; i < this.xStart + xTiles; i++) {
            for (let j = this.yStart; j < this.yStart + yTiles; j++) {
                this.bmdOverlay.ctx.clearRect(this.w * i, this.h * j, this.w, this.h);
            }
        }
    }

    //For now. This will be tweaked to include when picking up an object, etc.
    //Only draw rects when mouse is on the screen
    if (this.game.input.activePointer.withinGame) {
        //If the camera is scrolled so that it doesn't line up with the grid
        //i.e. it ends in the middle of one row (cutting it off)
        //then subtract the offset so that the mouse position still correctly finds the index
        this.index1 = Math.floor((this.game.input.x - (this.offsetx !== 0 ? curW - this.offsetx : 0)) 
            / curW) + this.upperLeftRow;
        this.index2 = Math.floor((this.game.input.y - (this.offsety !== 0 ? curH - this.offsety : 0)) 
            / curH) + this.upperLeftColumn;

        //update the grid offsets with the new index positions
        this.xStart = Math.min(Math.max(this.index1 - Math.floor(xTiles / 2), 0), 
            (this.game.world.width / curW) - xTiles);
        this.yStart = Math.min(Math.max(this.index2 - Math.floor(yTiles / 2), 0), 
            (this.game.world.height / curH) - yTiles);

        //draw all of the rectangles
        for (let i = this.xStart; i < this.xStart + xTiles; i++) {
            for (let j = this.yStart; j < this.yStart + yTiles; j++) {
                this.bmdOverlay.rect(this.w * i, this.h * j, this.w, this.h, '#66ff33');
            }
        }
    }
};