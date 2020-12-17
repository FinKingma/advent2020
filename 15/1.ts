import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class Memory {
    position: number;
    value: number;
}

class BitMask {
    mask: string;
    memories: Memory[] = [];
}

let MEMREG = new RegExp('^mem\\[(.+)\\] = (\\d+)$');

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

const calculateNextNumber = (numbers:number[], turn:number) => {
    let lastNumber = numbers[numbers.length-1]
    // console.log('last: ' + lastNumber)
    if (numbers.filter(n=>n==lastNumber).length == 1) {
        //first occurance
        return 0;
    } else {
        // console.log('calculating new')
        for (let i=numbers.length-2;i>= 0;i--) {
            // console.log('found: ' + numbers[i] )
            if (numbers[i] == lastNumber) {
                // console.log('found at ' + i + ' last numberpos: ' + (numbers.length-1))
                return Math.abs(i - (numbers.length-1))
            }
        }
    }
    throw new Error('could not solve')
}

const solveProgram = async(): Promise<number> => {
    let startNumbers:number[] = await readFile('15/1.txt');
    let numbers:number[] = []
    let turn=0;
    do {
        if (startNumbers[turn] != undefined) {
            numbers[turn] = startNumbers[turn]
        } else {
            numbers[turn] = calculateNextNumber(numbers, turn)
            // console.log('calculate new number ' + numbers[turn] + ' for turn ' + turn)
        }
        turn++
    }
    while (turn < 2020)
    // console.log('res: ' + numbers)
    return numbers[numbers.length-1];
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})