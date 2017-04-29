/*
Play is the state containing the main game loop
*/

function Play() {};
Play.prototype = {
	preload: function() {
		console.log('Play: preload()');
	},
	create: function() {
		console.log('Play: create()');
		game.world.setBounds(0, 0, 2000, 2000);

		//orangish brown
		this.stage.backgroundColor = '#c1440e';
		this.g = new Grid(40, 40, 'black');
		this.g.makeGrid();
	},
	update: function() {
		this.g.update();


		if (this.input.activePointer.withinGame) {
			if (this.input.x > this.camera.view.width - 50) {
				this.camera.x += 5;
			}
			if (this.input.x < 50) {
				this.camera.x -= 5;
			}
			if (this.input.y > this.camera.view.height - 50) {
				this.camera.y += 5;
			}
			if (this.input.y < 50) {
				this.camera.y -= 5;
			}
		}
	},
	render: function() {
		//game.debug.text(game.input.activePointer.position, 2, 14, '#ffffff');
		//game.debug.cameraInfo(this.camera, 2, 64, '#ffffff');
		game.debug.text('x tiles: '+xTiles+', y tiles: '+yTiles, 2, 14, '#ffffff');
	}
};