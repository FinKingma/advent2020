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
    let tempTop = tile.top;
    tile.top = tile.right
    tile.right = tile.bottom
    tile.right.pocket = tile.right.pocket.split('').reverse().join('')
    tile.bottom = tile.left
    tile.left = tempTop
    tile.left.pocket = tile.left.pocket.split('').reverse().join('')
    
    return tile;
}

const flip = (tile:Tile) => {
    tile.top.pocket = tile.top.pocket.split('').reverse().join('')
    tile.bottom.pocket = tile.bottom.pocket.split('').reverse().join('')

    let tempLeft = tile.left.pocket;
    tile.left.pocket = tile.right.pocket;
    tile.right.pocket = tempLeft;
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
            if (tile.id == 3079) {
                console.log('new layout t: ' + tile.top.pocket + ' r: ' + tile.right.pocket + ' b: ' + tile.bottom.pocket + ' l: ' + tile.left.pocket)
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

            // if (solution.length == 1 && y==0 && x==1 && tile.id == 3079) {
            //     console.log('trying to click 3079 to 2311 ')
            //     // console.log(solution[1][1].id + ': ' + solution[1][1].right.pocket)
            //     // console.log(solution[2][0].id + ': ' + solution[2][0].top.pocket)
            //     // console.log('how about...')
            //     console.log('2311: ' + solution[0][0].right.pocket);
            //     console.log('3079: ' + rotatedTile.left.pocket);
            //     console.log('3079: ' + rotatedTile.bottom.pocket);
            //     console.log('test: ' + solution[y][x-1].right.pocket);
            //     console.log('res: ' + (solution[y][x-1].right.pocket != rotatedTile.left.pocket))
            //     console.log('neighbours: ' + hasAnyNeighbours + ' mismatch: ' + hasAnyMisMatches)
            // }

            if (!hasAnyMisMatches && hasAnyNeighbours) {
                if (rotatedTile.id == 3079) {
                    console.log('left: ' + rotatedTile.left.pocket)
                    console.log('matches with: ' + solution[0][0].right.pocket)
                }
                return rotatedTile;
            }

            rotatedTile = rotateTileBy90(tile)
        }
    }
    return null;
}

const rotateData90 = (data:string[][]) => {
    let newGrid:string[][] = []
    for (let i =0;i<data.length;i++) {
        newGrid.push(data.map(r => r[i]))
    }
    return newGrid
}

const rotateTileDataToMatch = (tile:Tile) => {
    if (tile.data[0].join('') != tile.top.pocket) {
        let attempts = 0;
        let maxAttempts = 10;
        do {
            if (attempts == 4) {
                //mirror the data
                tile.data.forEach(r => {
                    r = r.reverse()
                })
            }
            tile.data = rotateData90(tile.data)
            attempts++;
        }
        while (tile.data[0].join('') != tile.top.pocket && attempts < maxAttempts)

        if (tile.data[0].join('') != tile.top.pocket) {
            console.log('still failed trying to match tile ' + tile.id)
        }
        return tile;
    }
}

const solveProgram = async(): Promise<number> => {
    let availableTiles:Tile[] = await readFile('20/1.txt');
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

    solution.forEach(row=> {
        row.forEach(t => {
            t = rotateTileDataToMatch(t)
        })
    })
    
    return solution[0][0].id * 
        solution[solution.length-1][0].id *
        solution[0][solution[0].length-1].id *
        solution[solution.length-1][solution[0].length-1].id;
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