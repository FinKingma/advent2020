import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

export class Tile {
    id:number;
    degrees:number = 0;
    left: Border;
    right: Border;
    top: Border;
    bottom: Border;
    data:string[][] = []
}

class Border {
    connection:Connection = Connection.OPEN;
    pocket:string;
}

enum Connection {
    END,OPEN,CLOSED
}

const addPocketsTo = (tile:Tile, tileData:string[][]) => {
    let top:Border = new Border();
    top.pocket = tileData[0].join('')
    tile.top = top;

    let right:Border = new Border();
    right.pocket = tileData.map(r => r[r.length-1]).join('')
    tile.right = right;

    let bottom:Border = new Border();
    bottom.pocket = tileData[tileData.length-1].join('')
    tile.bottom = bottom;

    let left:Border = new Border();
    left.pocket = tileData.map(r => r[0]).join('')
    tile.left = left;

    tile.data = tileData

    return tile;
}

const readFile = async(file:string): Promise<Tile[]> => {
    return new Promise<Tile[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let rows = data.split('\n')
                let tiles:Tile[] = []
                let tile:Tile = new Tile();
                let tileData:string[][] = []
                for (let row of rows) {
                    if (row.startsWith('Tile')) {
                        tile = new Tile();
                        tile.id = +row.replace('Tile ', '').replace(':', '')
                        tileData = []
                    } else if (row == '') {
                        tile = addPocketsTo(tile, tileData)
                        tiles.push(tile)
                    } else {
                        tileData.push(row.split(''))
                    }
                }
                tile = addPocketsTo(tile, tileData)
                tiles.push(tile)
                resolve(tiles)
            }
        })
    })
}

const rotateTileBy90 = (tile:Tile) => {
    let newGrid:string[][] = []
    for (let i =tile.data[0].length-1;i>=0;i--) {
        newGrid.push(tile.data.map(r => r[i]))
    }
    tile.data = newGrid

    tile.top.pocket = tile.data[0].join('')
    tile.bottom.pocket = tile.data[tile.data.length-1].join('')
    tile.left.pocket = tile.data.map(r => r[0]).join('')
    tile.right.pocket = tile.data.map(r => r[r.length-1]).join('')
    
    return tile;
}

const flip = (tile:Tile) => {
    tile.data.forEach(r => {
        r = r.reverse()
    })

    tile.top.pocket = tile.data[0].join('')
    tile.bottom.pocket = tile.data[tile.data.length-1].join('')
    tile.left.pocket = tile.data.map(r => r[0]).join('')
    tile.right.pocket = tile.data.map(r => r[r.length-1]).join('')

    return tile;
}

const findTileThatFits = (solution:Tile[][], y:number, x:number, availableTiles:Tile[]) => {
    for (let tile of availableTiles) {
        for (let i=0;i<8;i++) {
            let hasAnyMisMatches = false;
            let hasAnyNeighbours = false;

            let rotatedTile = tile;
            if (i == 4) {
                // console.log('turning over')
                rotatedTile = flip(rotatedTile)
            }

            //checking left
            if (solution[y] && solution[y][x-1]) {
                hasAnyNeighbours = true
                if (solution[y][x-1].right.pocket != rotatedTile.left.pocket) {
                    hasAnyMisMatches = true
                }
            }

            //checking right
            if (solution[y] && solution[y][x+1]) {
                hasAnyNeighbours = true
                if (solution[y][x+1].left.pocket != rotatedTile.right.pocket) {
                    hasAnyMisMatches = true
                }
            } 

            //checking top
            if (solution[y-1] && solution[y-1][x]) {
                hasAnyNeighbours = true
                if (solution[y-1][x].bottom.pocket != rotatedTile.top.pocket) {
                    hasAnyMisMatches = true
                }
            }

            //checking bottom
            if (solution[y+1] && solution[y+1][x]) {
                hasAnyNeighbours = true
                if (solution[y+1][x].top.pocket != rotatedTile.bottom.pocket) {
                    hasAnyMisMatches = true
                }
            }

            if (!hasAnyMisMatches && hasAnyNeighbours) {
                return rotatedTile;
            }

            rotatedTile = rotateTileBy90(tile)
        }
    }
    return null;
}

class SeaMonster {
    pixels:number[][] = [[0,18],[1,0],[1,5],[1,6],[1,11],[1,12],[1,17],[1,18],[1,19],[2,1],[2,4],[2,7],[2,10],[2,13],[2,16]]
    width:number= 20
    height:number = 3
}

const rotateSeaBy90 = (sea:string[][]) => {
    let newSea:string[][] = []
    for (let i =sea[0].length-1;i>=0;i--) {
        newSea.push(sea.map(r => r[i]))
    }
    sea = newSea

    return sea;
}

const findSeaMonsters = (sea:string[][]) => {
    
    // let seaMonster = new SeaMonster();
    // let newGrid:string[][] = []
    // for (let y =0;y<seaMonster.height;y++) {
    //     let newRow:string[] = []
    //     for (let x=0;x<seaMonster.width;x++) {
    //         newRow.push('.')
    //     }
    //     newGrid.push(newRow)
    // }
    // for (let pixel of seaMonster.pixels) {
    //     newGrid[pixel[0]][pixel[1]] = '#'
    // }
    // newGrid.forEach(r => {
    //     console.log(': ' + r.join(''))
    // })
    sea.forEach(r => {
        console.log('res: ' + r)
    })
    for (let i =0;i<8;i++) {
        if (i==4) {
            sea.forEach(row => {
                row = row.reverse();
            })
        }

        if (hasASeaMonster(sea)) {
            countHashesWithoutSeaMonster(sea)
        }
        sea = rotateSeaBy90(sea)
    }
}

const countHashesWithoutSeaMonster = (sea:string[][]) => {
    let seaMonster = new SeaMonster();
    let amountOfSeaMonsters=  0;

    for (let y=0;y<sea.length-seaMonster.height;y++) {
        pixelLoop: for (let x=0;x<sea[y].length-seaMonster.width;x++) {
            for (let pixel of seaMonster.pixels) {
                if (sea[y + pixel[0]][x + pixel[1]] == '#') {
                    //found another pixel
                } else {
                    continue pixelLoop;
                }
            }
            amountOfSeaMonsters++;
        }
    }
    console.log('found ' + amountOfSeaMonsters + ' seamonsters in total')
    let hashes=  0
    sea.forEach(r => {r.forEach(s=> {
        if (s=='#') {
            hashes++;
        }
    })})
    console.log('amount of hashes: ' + hashes)
    console.log('each seamonster has ' + seaMonster.pixels.length + ' hashes')
    console.log('so that leaves us with ' + (hashes - (seaMonster.pixels.length * amountOfSeaMonsters)))
}

const hasASeaMonster = (sea:string[][]) => {
    let seaMonster = new SeaMonster();

    for (let y=0;y<sea.length-seaMonster.height;y++) {
        pixelLoop: for (let x=0;x<sea[y].length-seaMonster.width;x++) {
            for (let pixel of seaMonster.pixels) {
                if (sea[y + pixel[0]][x + pixel[1]] == '#') {
                    //found another pixel
                } else {
                    continue pixelLoop;
                }
            }
            return true;
        }
    }
    return false;
}

const solveProgram = async(): Promise<number> => {
    let availableTiles:Tile[] = await readFile('20/2.txt');
    console.log('tiles: ' + availableTiles.length)
    let solution:Tile[][] = []

    //lay first tile
    solution[0] = []
    solution[0][0] = availableTiles[0]
    availableTiles.splice(0,1)

    //start solve puzzle


    do {
        findPuzzleLoop: for (let y=0;y<solution.length;y++) {
            for (let x=0;x<solution[y].length;x++) {
                let puzzleChecks:number[][] = []
                puzzleChecks.push([0,1])
                puzzleChecks.push([0,-1])
                puzzleChecks.push([1,0])
                puzzleChecks.push([-1,0])

                for (let check of puzzleChecks) {
                    if (solution[y+check[0]] && solution[y+check[0]][x+check[1]]) {
                        //already fill, nvm
                    } else {
                        let newTile = findTileThatFits(solution, y+check[0], x+check[1], availableTiles)
                        if (newTile == null) {
                        } else {
                            try {
                            if (x+check[1] < 0) {
                                //column doesnt exist yet, need to shift the solutions
                                solution.forEach(r => {
                                    r.unshift(null)
                                })
                                solution[y+check[0]][0] = newTile
                            } else if (y+check[0] < 0) {
                                //row doesnt exist yet, need to shift the solutions
                                solution.unshift([null])
                                solution[0][x+check[1]] = newTile
                            } else if (x+check[1] >= solution[0].length) {
                                solution.forEach(r => {
                                    r.push(null)
                                })
                                solution[y+check[0]][x+check[1]] = newTile
                            } else if (y+check[0] >= solution.length) {
                                solution.push([null])
                                solution[y+check[0]][x+check[1]] = newTile
                            } else {
                                solution[y+check[0]][x+check[1]] = newTile
                            }
                            
                            availableTiles = availableTiles.filter(t => {
                                return t.id != newTile.id
                            })
                            continue findPuzzleLoop;
                        } catch (e) {
                            console.log('error: ' + e.stack)
                            throw new Error(e);
                        }
                        }
                    }
                }
            }
        }
    }
    while (availableTiles.length > 0)

    let sea:string[][] = []

    //remove boundaries
    solution.forEach(row => {
        row.forEach((t, i) => {
            if (!t) {
                row.splice(i, 1)
            } else {
                t.data.splice(0,1)
                t.data.splice(-1,1)
                t.data.forEach(r => {
                    r.splice(0,1)
                    r.splice(-1,1)
                })
            }
        })
    })

    solution.forEach(r => {
        let height = r[0].data.length;
        for (let i=0;i<height;i++) {
            sea.push(r.map(t=>t?t.data[i].join(''):null).join('').split(''))
        }
    })

    findSeaMonsters(sea)
    
    return 1;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})