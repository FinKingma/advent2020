import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class Tile {
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
    let tempBottom = tile.bottom;
    tile.bottom = tile.left
    tile.left = tile.top
    tile.top = tile.right
    tile.right = tempBottom
    
    return tile;
}

const mirrorTile = (tile:Tile) => {
    let tempLeft = tile.left;
    tile.left = tile.right;
    tile.right = tempLeft;
    return tile;
}

const findTileThatFits = (solution:Tile[][], y:number, x:number, availableTiles:Tile[]) => {
    if (availableTiles.length == 4 && y==1 && x==2) {
        solution.forEach(r => {
            console.log('row: ' + r.map(t=>t? t.id : ''))
        })

        // console.log('trying to find a tile that fits next to ' + solution[1][1].id)
        // console.log(solution[1][1].id + ': ' + solution[1][1].left.pocket)
        // console.log(solution[2][0].id + ': ' + solution[2][0].top.pocket)
        // console.log('how about...')
        // console.log(': ' + availableTiles.filter(t => t.id == 2729)[0].bottom.pocket);
    }
    for (let tile of availableTiles) {
        let hasAnyMisMatches = false;
        let hasAnyNeighbours = false;
        for (let i=0;i<8;i++) {
            let rotatedTile = tile;
            if (i == 4) {
                rotatedTile = mirrorTile(rotatedTile)
            }

            //checking left
            if (solution[y] && solution[y][x-1]) {
                hasAnyNeighbours = true
                if (solution[y][x-1].right.pocket != rotatedTile.left.pocket.split('').reverse().join('')) {
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
                if (solution[y-1][x].bottom.pocket != rotatedTile.top.pocket.split('').reverse().join('')) {
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
    let availableTiles:Tile[] = await readFile('20/1.txt');
    // availableTiles.forEach(t => {
    //     console.log('tile: ' + t.id + ' left: ' + t.left.pocket + ' right: ' + t.right.pocket + ' top: ' + t.top.pocket + ' bottom: ' + t.bottom.pocket)
    // })
    let solution:Tile[][] = []

    //lay first tile
    solution[0] = []
    solution[0][0] = availableTiles[0]
    availableTiles.splice(0,1)

    //start solve puzzle
    let attempts = 0
    let maxAttempts = 3

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
                        // console.log('piece is already filled at y: ' + (y+check[0]) + ' | x: ' + (x+check[1]))
                    } else {
                        let newTile = findTileThatFits(solution, y+check[0], x+check[1], availableTiles)
                        if (newTile == null) {
                            // console.log('no tile found to put at y: ' + (y+check[0]) + ' x: ' + (x+check[1]))
                        } else {
                            // console.log('laying tile ' + newTile.id + ' to pos y: ' + (y+check[0]) + ' x: ' + (x+check[1]))
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
                            } else {
                                solution[y+check[0]][x+check[1]] = newTile
                            }
                            
                            availableTiles = availableTiles.filter(t => {
                                return t.id != newTile.id
                            })
                            drawSolution(solution)
                            console.log('remaining tiles: ' + availableTiles.map(t=>t.id))
                            continue findPuzzleLoop;
                        }
                    }
                }
            }
        }

        attempts++;
    }
    while (availableTiles.length > 0 && attempts < maxAttempts)
    
    return 1;
}

const drawSolution = (solution:Tile[][]) => {
    solution.forEach(r => {
        r.forEach(t => {
            if (t) {
                let tileData:string[][] = []
                tileData.push(t.top.pocket.split(''))
                for (let i =1;i<9;i++) {
                    let tempRow = [t.left.pocket.split('')[i],'.','.','.','.','.','.','.','.',t.right.pocket.split('')[i]]
                    tileData.push(tempRow)
                }
                tileData.push(t.bottom.pocket.split(''))
    
                t.data = tileData;
            }
        })
    })

    solution.forEach(row => {
        console.log('data: ' + row.map(t=>t? 'tile: '+t.id: '          ').join('            '))
        for (let i=0;i<10;i++) {
            console.log('data:'+row.map(t=>t?t.data[i]:'                   ').join(' | '))
        }
    })
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})