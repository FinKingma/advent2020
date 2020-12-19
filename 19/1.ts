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

class Input {
    rules:string[] = []
    messages:string[] = []
}

const readFile = async(file:string): Promise<Input> => {
    return new Promise<Input>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let rows = data.split('\n')
                let foundAllRules =false;
                let input = new Input();
                for (let row of rows) {
                    if (row == '') {
                        foundAllRules = true;
                        continue;
                    }
                    if (!foundAllRules) {
                        let rule = row.split(':')
                        input.rules[rule[0]] = rule[1].trim();
                    } else {
                        input.messages.push(row);
                    }
                }
                resolve(input)
            }
        })
    })
}

let REG = /(\d+)/g

const createRegExpFromRules = async(data:string[]): Promise<string> => {

    let startingLine = data[0];

    let attempts = 0
    let maxAttempts = 32;

    do {
        // console.log('checking line: ' + startingLine)
        let res = REG.exec(startingLine)
        let index = res[1]
        let newPart = data[index]
        if (newPart.indexOf('|') != -1) {
            newPart = '(?:' + newPart + ')'
            // console.log('created new part: ' + newPart)
        }
        // console.log('number ' + index + ' will become: ' + newPart)
        startingLine = startingLine.replace(index, newPart)
        attempts++;
    }
    while (startingLine.match(REG))

    startingLine = startingLine.replace(/['" ]+/g,'')
    // console.log('res: ' + startingLine)
    return startingLine;
}

const solveProgram = async(): Promise<number> => {
    let input:Input = await readFile('19/1.txt');
    let regexpString = await createRegExpFromRules(input.rules)
    let reg = new RegExp('^' + regexpString + '$', 'g')
    let validMessages = 0;
    for (let message of input.messages) {
        if (message.match(reg)) {
            console.log('msg: ' + message + ' is valid')
            validMessages++;
        }
    }
    return validMessages;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})