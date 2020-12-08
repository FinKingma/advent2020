import * as fs from 'fs'
import { Observable } from 'rxjs';

class Instruction {
    operation:string;
    argument:number;
    triggered:boolean = false;
}

let instructions:Instruction[] = [];
let numberOfInstructions:number = -1;

var findInfiniteLoop = () => {
    console.log('finding loop')
    let acc = 0;
    let currentPos = 0
    do {
        if (instructions[currentPos].triggered) {
            console.log('found loop at acc: ' + acc)
            return;
        } else {
            instructions[currentPos].triggered = true;
            switch (instructions[currentPos].operation) {
                case 'nop':
                    currentPos++
                    break;
                case 'acc':
                    acc+= instructions[currentPos].argument;
                    currentPos++
                    break;
                case 'jmp':
                    currentPos+= instructions[currentPos].argument;
                    break;
                default:
                    throw new Error('not implemented');
            }
        }
    }
    while (currentPos < instructions.length)
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
            findInfiniteLoop()
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

fs.readFile("8/1.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        transformProgram(data);
    }
})