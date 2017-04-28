function Grid(w, h) {
	this.w = w;
	this.h = h;

	this.bmd = game.add.bitmapData(game.world.width, game.world.height);
	this.bmd.ctx.lineWidth = 1;
	this.bmd.ctx.strokeStyle = 'black';
	game.add.sprite(0, 0, this.bmd);
}

Grid.prototype.draw = function() {
	for (let i = 0; i < game.world.width; i += this.w) {
		this.bmd.ctx.moveTo(i, 0);
		this.bmd.ctx.lineTo(i, game.world.height);
		this.bmd.ctx.stroke();
		this.bmd.render();
	}

	for (let i = 0; i < game.world.height; i += this.h) {
		this.bmd.ctx.moveTo(0, i);
		this.bmd.ctx.lineTo(game.world.width, i);
		this.bmd.ctx.stroke();
		this.bmd.render();
	}
};

Grid.prototype.update = function() {
	
};
