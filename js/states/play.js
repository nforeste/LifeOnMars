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
		//orangish brown
		this.stage.backgroundColor = '#c1440e';
		this.g = new Grid(32, 32);
		this.g.draw();
	},
	update: function() {
		//this.g.update();
	}
};