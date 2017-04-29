var v1, v2;

function Grid(w, h, lineW, lineC) {
	this.w = w;
	this.h = h;

	this.bmd = game.add.bitmapData(game.world.width, game.world.height);
	this.bmd.ctx.lineWidth = lineW;
	this.bmd.ctx.strokeStyle = lineC;
	this.sprite = game.add.sprite(0, 0, this.bmd);

	//create a 2-Dimensional matrix to represent the grid
	//this will be used for terrain (cells[3][4] is a mountain)
	this.cells = [];
	for (let i = 0; i < game.world.width / w; i++) {
		this.cells[i] = [];
	}

	this.index1 = -1;
	this.index2 = -1;

	offsetx = 0;
	offsety = 0;
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

	//vars for debugging
	v1 = this.upperLeftRow;
	v2 = this.upperLeftColumn;

	if (this.index1 >= 0 && this.index2 >= 0) {
		this.bmd.ctx.clearRect((this.w * this.index1) + 1, (this.h * this.index2) + 1, this.w - 2, this.h - 2);
	}

	var lineW = this.bmd.ctx.lineWidth;

	//For now. This will be tweaked to include when picking up an object, etc.
	//Only draw rects when mouse is on the screen
	if (game.input.activePointer.withinGame) {
		//If the camera is scrolled so that it doesn't line up with the grid
		//i.e. it ends in the middle of one row (cutting it off)
		//then subtract the offset so that the mouse position still correctly finds the index
		this.index1 = Math.floor((game.input.x - (this.offsetx !== 0 ? this.w - this.offsetx : 0)) / this.w) + this.upperLeftRow;
		this.index2 = Math.floor((game.input.y - (this.offsety !== 0 ? this.h - this.offsety : 0)) / this.h) + this.upperLeftColumn;
		this.bmd.rect((this.w * this.index1) + lineW, (this.h * this.index2) + lineW, 
			this.w - (lineW + 1), this.h - (lineW + 1), '#0000ff');
	}
};
