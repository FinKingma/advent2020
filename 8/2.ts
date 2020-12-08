import * as fs from 'fs'
import { Observable } from 'rxjs';

class Instruction {
    operation:string;
    argument:number;
    triggered:boolean = false;
}

let instructions:Instruction[] = [];
let numberOfInstructions:number = -1;

var findInfiniteLoop = (tempInstructions) => {
    // console.log('finding loop')
    let acc = 0;
    let currentPos = 0
    do {
        if (tempInstructions[currentPos].triggered) {
            // console.log('found loop at acc: ' + acc)
            return;
        } else {
            tempInstructions[currentPos].triggered = true;
            switch (tempInstructions[currentPos].operation) {
                case 'nop':
                    currentPos++
                    break;
                case 'acc':
                    acc+= tempInstructions[currentPos].argument;
                    currentPos++
                    break;
                case 'jmp':
                    currentPos+= tempInstructions[currentPos].argument;
                    break;
                default:
                    throw new Error('not implemented');
            }
        }
    }
    while (currentPos < tempInstructions.length)
    console.log('program terminated with ' + acc)
    return acc;
}

var transformProgram = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n');
        numberOfInstructions = rows.length
        
        for (let row of rows) {
            let attributes = new RegExp('^(.+) (.+)').exec(row)

            let ins = new Instruction();
            ins.operation = attributes[1];
            ins.argument = +attributes[2];
            
            observer.next(ins)
        }
    })

    const nextFunc = (value) => {
        console.log('got new instruction: ' + value.argument)
        instructions.push(value)
        
        if (instructions.length === numberOfInstructions) {
            console.log('got them all')
            for (let i = 0;i < instructions.length; i++) {
                let tempInstructions = [];
                for (let instruction of instructions) {
                    let ins = new Instruction();
                    ins.operation = instruction.operation
                    ins.argument = instruction.argument
                    tempInstructions.push(ins)
                }
                
                if (instructions[i].operation === 'nop') {
                    tempInstructions[i].operation = 'jmp'
                    findInfiniteLoop(tempInstructions);

                } else if (instructions[i].operation === 'jmp') {
                    tempInstructions[i].operation = 'nop'
                    findInfiniteLoop(tempInstructions)
                }

            }
        }
    }
    
    const errorFunc = (error) => {
        console.log("Caught error: " + error);
    }
    const completeFunc = () => {
        console.log("Completed");
    }
    observable.subscribe(nextFunc, errorFunc, completeFunc);
};

fs.readFile("8/2.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        transformProgram(data);
    }
})