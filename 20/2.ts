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

export const rotateTileBy90 = (tile:Tile) => {
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
            if (tile.id==2473 && y==1 && x==2 && solution[1][1].id==1427) {
                //desired place for 2473
                // console.log('pocket of 1427 ' + solution[1][1].right.pocket)
                console.log('matching socket: ' + solution[1][1].right.pocket)
                console.log('current left of 2473 ' + tile.left.pocket)
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

const solveProgram = async(): Promise<number> => {
    let availableTiles:Tile[] = await readFile('20/2.txt');
    let solution:Tile[][] = []

    //lay first tile
    solution[0] = []
    solution[0][0] = availableTiles[0]
    availableTiles.splice(0,1)

    //start solve puzzle
    let attempts = 0;
    let maxAttempts = 10;

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
        attempts++;
    }
    while (availableTiles.length > 0 && attempts <maxAttempts)

    let sea:string[][] = []
    solution.forEach(r => {
        let height = r[0].data.length;
        for (let i=0;i<height;i++) {
            sea.push(r.map(t=>t?t.data[i].join(''):null).join('|').split(''))
        }
        let width = r[0].data[0].length * r.length
        let separatorRow = []
        for (let i=0;i<width;i++) {
            separatorRow.push('-')
        }
        sea.push(separatorRow)
    })

    sea.forEach(r => {
        console.log('res: ' + r.join(''))
    })
    
    return solution[0][0].id * 
        solution[solution.length-1][0].id *
        solution[0][solution[0].length-1].id *
        solution[solution.length-1][solution[0].length-1].id;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})