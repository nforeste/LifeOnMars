var xTiles, yTiles;

function Grid(w, h, lineC) {
	this.w = w;
	this.h = h;

	this.bmd = game.add.bitmapData(game.world.width, game.world.height);
	this.bmd.ctx.strokeStyle = lineC;

	//lineWidth was going to be an argument, but it broke everything :/
	this.bmd.ctx.lineWidth = 1;
	this.sprite = game.add.sprite(0, 0, this.bmd);

	//create a 2-Dimensional matrix to represent the grid
	//this will be used for terrain (cells[3][4] is a mountain)
	this.cells = [];
	for (let i = 0; i < game.world.width / w; i++) {
		this.cells[i] = [];
	}

	this.index1 = -1;
	this.index2 = -1;

	//TESTING
	xTiles = 3;
	yTiles = 1;
}

//Draws the grid on screen 
Grid.prototype.makeGrid = function() {
	for (let i = 0; i < game.world.width; i += this.w) {
		this.bmd.ctx.moveTo(i, 0);
		this.bmd.ctx.lineTo(i, game.world.height);
		this.bmd.ctx.stroke();
	}

	for (let i = 0; i < game.world.height; i += this.h) {
		this.bmd.ctx.moveTo(0, i);
		this.bmd.ctx.lineTo(game.world.width, i);
		this.bmd.ctx.stroke();
	}
};

Grid.prototype.update = function() {
	this.upperLeftRow = Math.ceil(game.camera.view.x / this.w);
	this.upperLeftColumn = Math.ceil(game.camera.view.y / this.h);
	this.offsetx = game.camera.view.x % this.w;
	this.offsety = game.camera.view.y % this.h;

	//Offset for the tile highlighting
	var xStart = this.index1 - (xTiles > 2 ? Math.floor(xTiles / 2) : 0);
	var yStart = this.index2 - (yTiles > 2 ? Math.floor(yTiles / 2) : 0);
	//round them both up to 0 (min)
	xStart = xStart < 0 ? 0 : xStart;
	yStart = yStart < 0 ? 0 : yStart;

	if (this.index1 >= 0 && this.index2 >= 0) {
		for (let i = xStart; i < xStart + xTiles; i++) {
			for (let j = yStart; j < yStart + yTiles; j++) {
				this.bmd.ctx.clearRect((this.w * i) + 1, (this.h * j) + 1, this.w - 2, this.h - 2);
			}
		}
	}

	//For now. This will be tweaked to include when picking up an object, etc.
	//Only draw rects when mouse is on the screen
	if (game.input.activePointer.withinGame) {
		//If the camera is scrolled so that it doesn't line up with the grid
		//i.e. it ends in the middle of one row (cutting it off)
		//then subtract the offset so that the mouse position still correctly finds the index
		this.index1 = Math.floor((game.input.x - (this.offsetx !== 0 ? this.w - this.offsetx : 0)) / this.w) + this.upperLeftRow;
		this.index2 = Math.floor((game.input.y - (this.offsety !== 0 ? this.h - this.offsety : 0)) / this.h) + this.upperLeftColumn;

		//update the grid offsets with the new index positions
		xStart = this.index1 - (xTiles > 2 ? Math.floor(xTiles / 2) : 0);
		yStart = this.index2 - (yTiles > 2 ? Math.floor(yTiles / 2) : 0);
		//round them both up to 0 (min)
		xStart = xStart < 0 ? 0 : xStart;
		yStart = yStart < 0 ? 0 : yStart;

		//draw all of the rectangles
		for (let i = xStart; i < xStart + xTiles; i++) {
			for (let j = yStart; j < yStart + yTiles; j++) {
				this.bmd.rect((this.w * i) + 1, (this.h * j) + 1, this.w - 2, this.h - 2, '#66ff33');
			}
		}
	}
};