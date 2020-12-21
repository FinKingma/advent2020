import { TimeoutError } from "rxjs";

import { Tile, rotateTileBy90 } from './2'


test('adds 1 + 2 to equal 3', () => {
    let tile = new Tile();
    let data = '#....####.\n#..#.##...\n#.##..#...\n######.#.#\n.#...#.#.#\n.#########\n.###.#..#.\n########.#\n##...##.#.\n..###.#.#.'
    tile.data = data.split('\n').map(r => r.split(''))
    tile.top.pocket = tile.data[0].join('')
    tile.bottom.pocket = tile.data[tile.data.length-1].join('')
    tile.left.pocket = tile.data.map(r => r[0]).join('')
    tile.right.pocket = tile.data.map(r => r[r.length-1]).join('')

    tile = rotateTileBy90(tile)
    expect(tile.top.pocket).toBe('...###.#..');
});
