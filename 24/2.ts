import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';
import { deprecate } from 'util';

const readFile = async(file:string): Promise<string[]> => {
    return new Promise<string[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                resolve(data.split('\n'))
            }
        })
    })
}

class Tile {
    color:string
    willBeFlipped:boolean = false
}

const updateGrid = async(hexGrid:Tile[][], currentTopPos:number, currentRightPos:number) => {
    if (hexGrid[currentTopPos][currentRightPos].color == 'black') {
        // console.log('flipped tile back to white at ' + currentTopPos + ' | ' + currentRightPos)
        hexGrid[currentTopPos][currentRightPos].color = 'white'
    } else if (hexGrid[currentTopPos][currentRightPos].color == 'white') {
        // console.log('flipped tile back to black at ' + currentTopPos + ' | ' + currentRightPos)
        hexGrid[currentTopPos][currentRightPos].color = 'black'
    }
    return hexGrid;
}

const getBlackNeighboursOf = (hexGrid:Tile[][], rIndex:number, tIndex:number) => {
    let blackNeighbours = 0;
    let neighbourPos:number[][] = [[0,2],[0,-2],[1,1],[1,-1],[-1,1],[-1,-1]]
    neighbourPos.forEach(pos => {
        if (hexGrid[rIndex+pos[0]] && hexGrid[rIndex+pos[0]][tIndex+pos[1]] && hexGrid[rIndex+pos[0]][tIndex+pos[1]].color == 'black') {
            blackNeighbours++;
        }
    })
    // if (rIndex == 100 && tIndex == 100) {
        // console.log('found black neighbours for pos ' + rIndex + ' | ' + tIndex + ' = ' + blackNeighbours)
    // }
    return blackNeighbours;
}

const solveProgram = async(): Promise<number> => {
    let directions:string[] = await readFile('24/2.txt');

    let gridSize = 1000;

    let hexGrid:Tile[][] = []
    for (let i = 0;i<gridSize;i++) {
        hexGrid[i] = []
        for (let j=0;j<gridSize;j++) {
            if (i%2==0) {
                //for even rows, fill even numbers with white tiles
                if (j%2 ==0) {
                    let blankTile:Tile = new Tile();
                    blankTile.color = 'white';
                    hexGrid[i][j] = blankTile
                }
            } else {
                if (j%2 == 1) {
                    let blankTile:Tile = new Tile();
                    blankTile.color = 'white';
                    hexGrid[i][j] = blankTile
                }
            }
        }
    }

    for (let direction of directions) {
        let currentTopPos = gridSize/2;
        let currentRightPos = gridSize/2;
        hexGrid = await updateGrid(hexGrid,50, 50)
        do {
            if (direction.startsWith('se')) {
                direction = direction.substring(2)
                currentTopPos-=1
                currentRightPos+=1
            } else if (direction.startsWith('sw')) {
                direction = direction.substring(2)
                currentTopPos-=1
                currentRightPos-=1
            } else if (direction.startsWith('ne')) {
                direction = direction.substring(2)
                currentTopPos+=1
                currentRightPos+=1
            } else if (direction.startsWith('nw')) {
                direction = direction.substring(2)
                currentTopPos+=1
                currentRightPos-=1
            } else if (direction.startsWith('e')) {
                direction = direction.substring(1)
                currentRightPos+=2
            } else if (direction.startsWith('w')) {
                direction = direction.substring(1)
                currentRightPos-=2
            }
        }
        while (direction.length > 0)
        hexGrid = await updateGrid(hexGrid,currentTopPos, currentRightPos)
    }
    
    let rounds = 100;

    for (let round=1;round<=rounds;round++) {
        await hexGrid.forEach((r,rIndex)=> {
            r.forEach((t, tIndex) => {
                let blackNeighbours = getBlackNeighboursOf(hexGrid, rIndex, tIndex)
                // if (round == 2 && rIndex==49 && tIndex==53) {
                //     console.log('tile found ' + blackNeighbours)
                // }
                if (t.color=='black' && blackNeighbours == 0 || t.color=='black' && blackNeighbours > 2) {
                    t.willBeFlipped = true
                } else if (t.color == 'white' && blackNeighbours == 2) {
                    t.willBeFlipped = true
                }
            })
        })
    
        await hexGrid.forEach(r=> {
            r.forEach(t => {
                if (t.willBeFlipped) {
                    if (t.color == 'black') {
                        t.color = 'white'
                        t.willBeFlipped = false
                    } else if (t.color == 'white') {
                        t.color = 'black'
                        t.willBeFlipped = false
                    }
                }
            })
        })
    }

    // hexGrid[50][50].color = 'silver'

    for (let i=0;i< gridSize;i++) {
        if (hexGrid[i]) {
            for (let j=0;j<gridSize;j++) {
                if (!hexGrid[i] || !hexGrid[i][j]) {
                    hexGrid[i][j] = undefined
                }
            }
            console.log('| ' + hexGrid[i].map(t=> (t == undefined)? ' ' : (t.color=='silver')? '$': (t.color=='black')? '#' : '.').join('') + ' |')
        }
    }

    let totalBlack = 0;
    hexGrid.forEach(r=> {
        r.forEach(t => {
            if (t && t.color=='black') {
                totalBlack++;
            }
        })
    })
    
    return totalBlack;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})