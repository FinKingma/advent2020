import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

const readFile = async(file:string): Promise<number[]> => {
    return new Promise<number[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let numbers = data.split(',').map(n=>+n)
                resolve(numbers)
            }
        })
    })
}

const solveProgram = async(): Promise<number> => {
    let startNumbers:number[] = await readFile('15/2.txt');
    let passedNumbers:number[] = []
    let turn=0;
    let maxTurns=30000000;
    let number;
    let nextNumber = 0;
    do {
        if (turn < startNumbers.length) {
            number = startNumbers[turn]
            nextNumber = 0
        } else {
            if (passedNumbers[nextNumber] != undefined) {
                number = nextNumber;
                nextNumber = Math.abs(passedNumbers[nextNumber] - turn);
            } else {
                number = nextNumber
                nextNumber = 0
            }
        }
        passedNumbers[number] = turn
        turn++
    }
    while (turn < maxTurns)

    for (let i=0;i<passedNumbers.length;i++) {
        if (passedNumbers[i] == (maxTurns-1)) {
            return i
        }
    }
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})