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
                input.rules[8] = '42 | 42 8'
                input.rules[11] = '42 31 | 42 11 31'
                resolve(input)
            }
        })
    })
}

let REG = /(\d+)/g

const abidesByLoop = (numbers:string, reg42String:string, reg31String:string) => {
    let reg42 = new RegExp(reg42String, 'g')
    let reg31 = new RegExp(reg31String, 'g')
    console.log('rule 31: ' + reg42String)

    let amountOf31s = 0
    let amountOf42s = 0

    console.log('disecting: ' + numbers)

    let rule31Res = numbers.match(reg31)
    if (rule31Res) {
        numbers = numbers.replace(rule31Res[0], '')
        // console.log('found 31')
        amountOf31s++
    }

    do {
        let rule42Res = numbers.match(reg42)
        if (rule42Res) {
            numbers = numbers.replace(rule42Res[0], '')
            // console.log('found 42')
            amountOf42s++
        }
    }
    while (numbers.match(reg42String))

    do {
        let rule31Res = numbers.match(reg31)
        if (rule31Res) {
            numbers = numbers.replace(rule31Res[0], '')
            // console.log('found 31')
            amountOf31s++
        }
    }
    while (numbers.match(reg31String))

    console.log('42s: ' + amountOf42s + ' 31s: ' + amountOf31s + ' with remainder: ' + numbers)
    if (numbers.length > 0) {
        console.log('still numbers remain: ' + numbers);
        return false
    }
    if (amountOf42s < 2) {
        console.log('not enough 42s')
        return false;
    }
    if (amountOf31s < 1) {
        console.log('not enough 31s')
        return false;
    }
    return amountOf42s > amountOf31s
}

const createRegExpFromRules = async(data:string[]): Promise<string> => {

    let startingLine = data[0];

    let attempts = 0
    let maxAttempts = 5000;

    do {
        // console.log('checking line: ' + startingLine)
        let res = REG.exec(startingLine)
        let index = res[1]
        let newPart = data[index]
        if (newPart.indexOf('|') != -1) {
            newPart = '(?:' + newPart + ')'

            let reg = new RegExp('[^\\d+]' + index + '[^\\d+]', 'g')
            if (reg.test(newPart)) {
                console.log('loop found in ' + index + ' | ' + newPart)
                if (index == '8') {
                    newPart = newPart.replace(index, '(?:42)*');
                } else if (index == '11') {
                    newPart = newPart.replace(index, '(.*)');
                } else {
                    throw new Error('did not except to fail at ' + index)
                }
                console.log('fixed with new line ' + newPart)
            }
            // console.log('created new part: ' + newPart)
        }
        // console.log('number ' + index + ' will become: ' + newPart)
        startingLine = startingLine.replace(index, newPart)
        attempts++;
    }
    while (startingLine.match(REG) && attempts < maxAttempts)

    // do {
    //     let res = REG.exec(startingLine)
    //     let index = res[1]
    //     // console.log('number ' + index + ' will become: ' + newPart)
    //     startingLine = startingLine.replace(index, '.*')
    // }
    // while (startingLine.match(REG))


    startingLine = startingLine.replace(/['" ]+/g,'')
    // console.log('res: ' + startingLine)
    return startingLine;
}

const solveProgram = async(): Promise<number> => {
    let input:Input = await readFile('19/2.txt');
    // let regexpString = await createRegExpFromRules(input.rules)
    // let reg = new RegExp('^' + regexpString + '$', 'g')
    // console.log('reg: ' + reg)
    let validMessages = 0;

    input.rules[0] = '42'
    let reg42String = await createRegExpFromRules(input.rules)

    input.rules[0] = '31'
    let reg31String = await createRegExpFromRules(input.rules)

    // console.log('rule42: ' + reg42String)
    // console.log('rule31: ' + reg31String)

    for (let message of input.messages) {
        if (abidesByLoop(message, '^'+reg42String, reg31String+'$')) {
            // console.log('but still valid')
            validMessages++
        }
        // if (message.match(reg)) {
        //     // console.log('msg: ' + message + ' is likely valid')
        //     let res = reg.exec(message)
        //     if (res && res[1] != undefined) {
        //         // console.log('this is like rule 11 and will require a balance between 42 and 31 ' + res[1])
        //         if (abidesByLoop(res[1], reg42String, reg31String)) {
        //             // console.log('but still valid')
        //             validMessages++
        //         }
        //     } else {
        //         validMessages++;
        //     }
        // }
    }
    return validMessages;

    // 375 > X < 395
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})