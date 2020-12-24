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

const updateGrid = async(hexGrid:string[][], currentTopPos:number, currentRightPos:number) => {
    if (!hexGrid[currentTopPos]) {
        hexGrid[currentTopPos] =[]    
    }
    if (!hexGrid[currentTopPos][currentRightPos]) {
        console.log('flipped tile to black at ' + currentTopPos + ' | ' + currentRightPos)
        totalBlack++;
        hexGrid[currentTopPos][currentRightPos] = 'black'
    } else if (hexGrid[currentTopPos][currentRightPos] == 'black') {
        console.log('flipped tile back to white at ' + currentTopPos + ' | ' + currentRightPos)
        totalBlack--;
        hexGrid[currentTopPos][currentRightPos] = 'white'
    } else if (hexGrid[currentTopPos][currentRightPos] == 'white') {
        console.log('flipped tile back to black at ' + currentTopPos + ' | ' + currentRightPos)
        totalBlack++;
        hexGrid[currentTopPos][currentRightPos] = 'black'
    }
    return hexGrid;
}
let totalBlack = 0

const solveProgram = async(): Promise<number> => {
    let directions:string[] = await readFile('24/1.txt');

    let hexGrid:string[][] = []

    for (let direction of directions) {
        let currentTopPos = 0;
        let currentRightPos = 0;
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
    
    return totalBlack;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})