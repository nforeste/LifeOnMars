function Generate(game) {
    this._game = game;
}

function sumOctave(x, y, octave, persistence, scale, low, high) {
    let maxAmp = 0;
    let amp = 1;
    let freq = scale;
    let total = 0;

    for (let i = 0; i < octave; ++i) {
        total += noise.simplex2(x * freq, y * freq) * amp;
        maxAmp += amp;
        amp *= persistence;
        freq *= 2;
    }

    total /= maxAmp;
    total = total * (high - low) / 2 + (high + low) / 2;
    return total;
}

Generate.prototype.run = function() {
    noise.seed(Math.random());
    let perlinNoise = [];
    this.tiles = [];
    let scale = .02;
    for (let i = 0; i < 126; i++) {
        perlinNoise[i] = [];
        this.tiles[i] = [];
        for (let j = 0; j < 126; j++) {
            perlinNoise[i][j] = sumOctave(i, j, 6, .5, scale, 0, 1);
        }
    }

    this.tilemap = this._game.add.tilemap('test');
    this.layer1 = this.tilemap.create('Tile Layer 1', 126, 126, 32, 32);

    this.tilemap.addTilesetImage('terrain');

    this.waterTiles = [3, 5, 9];
    this.normalTiles = [1, 2, 4, 6, 10];
    this.ironTiles = [7, 8, 11];
    for (let i = 0; i < 126; i++) {
        for (let j = 0; j < 126; j++) {
            if (perlinNoise[i][j] < .25) {
                let random = Math.floor(Math.random() * (this.waterTiles.length + 1));
                if (random < this.waterTiles.length) {
                    this.tilemap.putTile(this.waterTiles[random], i, j, this.layer1);
                    this.tiles[i][j] = 'water';
                }
            } else if (perlinNoise[i][j] < .75) {
                let random = Math.floor(Math.random() * (this.normalTiles.length + 5));
                if (random < this.normalTiles.length) {
                    this.tilemap.putTile(this.normalTiles[random], i, j, this.layer1);
                }
            } else {
                let random = Math.floor(Math.random() * (this.ironTiles.length + 1));
                if (random < this.ironTiles.length) {
                    this.tilemap.putTile(this.ironTiles[random], i, j, this.layer1);
                    this.tiles[i][j] = 'iron';
                }
            }
        }
    }
};