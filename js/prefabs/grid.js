'use strict';


/**
 * @param {Phaser.Game} game -- reference to the current game instance
 * @param {number} w -- width of each grid cell
 * @param {number} h -- height of each grid cell
 * @param {string} lineC -- lineColor
 */
function Grid(game, w, h, lineC) {
    this.game = game;
    this.w = w;
    this.h = h;

    this.gridsRef = [];
    this.gridsSpr = [];
    for (let i = 0; i < 3; i++) {
        //960x768 used because it is smallest common multiple of 32, 48, and 64 above 800x600
        this.gridsRef[i] = game.add.bitmapData(960, 768);
        this.gridsRef[i].ctx.strokeSylte = lineC;
        this.gridsRef[i].ctx.lineWidth = 1;
        this.gridsSpr[i] = game.add.tileSprite(0, 0, 960, 768, this.gridsRef[i]);
        if (i !== 0) {
            this.gridsSpr[i].kill();
        }
    }

    //create a 2-Dimensional matrix to represent the grid
    //this will be used for terrain (cells[3][4] is a mountain)
    this.cells = [];
    for (let i = 0; i < game.world.width / w; i++) {
        if (!this.cells[i]) {
            this.cells[i] = [];
        }

        for (let j = 0; j < game.world.height / h; j++) {
            this.cells[i][j] = {
                occupied: false,
                connect: -1
            };
        }
    }

    //bmdOverlay is the bitmapData that draws the highlights on the grid
    this.bmdOverlay = game.add.bitmapData(960, 768);
    this.bmdSprite = game.add.sprite(0, 0, this.bmdOverlay);

    this.index1 = -1;
    this.index2 = -1;
}

Grid.prototype.makeGrid = function() {
    for (let x = 0; x < 3; x++) {
        //((x / 2) + 1) === 1, 1.5, 2
        for (let i = 0; i < this.game.world.width; i += this.w * ((x / 2) + 1)) {
            this.gridsRef[x].ctx.moveTo(i, 0);
            this.gridsRef[x].ctx.lineTo(i, 768);
        }

        for (let i = 0; i < this.game.world.height; i += this.h * ((x / 2) + 1)) {
            this.gridsRef[x].ctx.moveTo(0, i);
            this.gridsRef[x].ctx.lineTo(960, i);
        }
        this.gridsRef[x].ctx.stroke();
    }
};

/**
 * @param  {number} xTiles -- number of cells to draw in the x direction
 * @param  {number} yTiles -- number of cells to draw in the y direction
 * @param  {number} opacity -- opacity of the highlighting
 */
Grid.prototype.draw = function(xTiles, yTiles, opacity, color) {
    var curW = this.w * this.game.worldScale;
    var curH = this.h * this.game.worldScale;
    this.upperLeftRow = Math.floor(this.game.camera.view.x / curW);
    this.upperLeftColumn = Math.floor(this.game.camera.view.y / curH);
    this.offsetx = this.game.camera.view.x % curW;
    this.offsety = this.game.camera.view.y % curH;

    //change the opacity of the overlay
    this.bmdOverlay.ctx.globalAlpha = opacity;

    //clear the canvas
    this.bmdOverlay.ctx.clearRect(0, 0, 960, 768);

    //move the sprite along with the camera with the offset
    this.bmdSprite.x = this.game.camera.x - this.offsetx;
    this.bmdSprite.y = this.game.camera.y - this.offsety;

    //If the camera is scrolled so that it doesn't line up with the grid
    //i.e. it ends in the middle of one row (cutting it off)
    //then subtract the offset so that the mouse position still correctly finds the index
    this.index1 = Math.floor((this.game.input.x + this.offsetx) / curW);
    this.index2 = Math.floor((this.game.input.y + this.offsety) / curH);

    //update the grid offsets with the new index positions
    this.xStart = Math.min(Math.max(this.index1 - Math.floor(xTiles / 2), 0),
        (this.game.world.width / curW) - xTiles);
    this.yStart = Math.min(Math.max(this.index2 - Math.floor(yTiles / 2), 0),
        (this.game.world.height / curH) - yTiles);

    //draw the background highlights
    this.bmdOverlay.ctx.fillStyle = color;
    this.bmdOverlay.ctx.fillRect(curW * this.xStart, curH * this.yStart, curW * xTiles, curH * yTiles);
};