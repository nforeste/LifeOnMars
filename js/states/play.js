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
		this.g = new Grid(40, 40, 1, 'black');
		this.g.makeGrid();

		this.cursors = this.input.keyboard.createCursorKeys();
	},
	update: function() {
		this.g.update();

		if (this.cursors.down.isDown) {
			this.camera.y += 5;
		}
		if (this.cursors.up.isDown) {
			this.camera.y -= 5;
		}
		if (this.cursors.right.isDown) {
			this.camera.x += 5;
		}
		if (this.cursors.left.isDown) {
			this.camera.x -= 5;
		}
	},
	render: function() {
		game.debug.text(game.input.activePointer.position, 2, 14, '#ffffff');
		game.debug.cameraInfo(this.camera, 2, 64, '#ffffff');
		game.debug.text('row: ' + v1 + ', col: ' + v2, 2, 180, '#ffffff');
	}
};