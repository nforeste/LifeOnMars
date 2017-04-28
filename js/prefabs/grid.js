function Grid(w, h, lineW, lineC) {
	this.w = w;
	this.h = h;

	this.bmd = game.add.bitmapData(game.world.width, game.world.height);
	this.bmd.ctx.lineWidth = lineW;
	this.bmd.ctx.strokeStyle = lineC;
	game.add.sprite(0, 0, this.bmd);

	//this.tile = game.add.tileSprite(0, 0, game.world.width, game.world.height, this.bmd);
}

//Draws the grid on screen 
Grid.prototype.draw = function() {
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
	//Either use tileSprite, OR bigger bitmapData with camera scrolling
	//camera scrolling is probably better option in my opinion
};
