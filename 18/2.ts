import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

/*

If a cube is active and exactly 2 or 3 of its neighbors are also active, the cube remains active. Otherwise, the cube becomes inactive.
If a cube is inactive but exactly 3 of its neighbors are active, the cube becomes active. Otherwise, the cube remains inactive.

.#.
..#
###

...
#.#
.##
.#.

*/

let cube:string[][][] = []

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

let REG_ADD = /(\d+ \+ \d+)/g
let REG_MULT = /(\d+ \* \d+)/g

const solveEquations = async(data:string): Promise<string> => {
    // console.log('start: ' + data)

    if (data.match(REG_ADD)) {
        do {
            let res = REG_ADD.exec(data)
            let result = eval(res[1])
            data = data.replace(res[1], result)
        }
        while (data.match(REG_ADD))
    }

    if (data.match(REG_MULT)) {
        do {
            let res = REG_MULT.exec(data)
            let result = eval(res[1])
            data = data.replace(res[1], result)
        }
        while (data.match(REG_MULT))
    }

    // console.log('res: ' + data)
    return data;
}

const solveProgram = async(): Promise<number> => {
    let formulas:string[] = await readFile('18/2.txt');
    let total = 0
    for (let data of formulas)  {

        //solve groups
        while (data.indexOf('(') != -1) {
            let groupInit;
            for (let i =0;i<data.length;i++) {
                if (data[i] == '(') {
                    //found start of group
                    groupInit = i
                }
                if (data[i] == ')') {
                    //found end of group
                    let subString = data.substring(groupInit, i+1)
                    let result = await solveEquations(subString.replace('(', '').replace(')', ''));
                    // console.log('substring: |' + subString + '| res: |' + result + '|')
                    data = data.replace(subString, result.toString())
                    // console.log('new res: ' + data)
                    break;
                }
            }
        }

        let newNumb = await solveEquations(data)
        total += +newNumb;

    }
    return total;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})