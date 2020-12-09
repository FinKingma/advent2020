import * as fs from 'fs'
import { Observable } from 'rxjs';

let numbers:number[] = [];
let preamble:number = 25;

const calculateContinuousSet = (value) => {
    for (let i = 0; i < numbers.length; i++) {
        let sum = 0
        let setPos = i;
        let setNumbers:number[] = [];
        do {
            setNumbers.push(+numbers[setPos])
            sum+= numbers[setPos];
            setPos++;
            if (sum === value && setNumbers.length > 1) {
                console.log('found continuous set: ' + setNumbers);
                console.log('result: ' + (Math.min(...setNumbers) + Math.max(...setNumbers)));
            }
        }
        while (sum <= value);
    }
}

const numberIsValid = (number) => {
    for (let i = numbers.length - preamble; i < numbers.length; i++) {
        for (let j = numbers.length - preamble; j < numbers.length; j++) {
            if (i!==j) {
                if (numbers[i] + numbers[j] === number) {
                    return true;
                }
            }
        }
    }
    return false;
}

var transformProgram = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n');
        
        for (let row of rows) {
            observer.next(+row)
        }
    })

    const nextFunc = (value) => {
        // console.log('got new instruction: ' + value)
        if (numbers.length < preamble) {
            numbers.push(value);
        } else if (numberIsValid(value)) {
            numbers.push(value);
        } else {
            numbers.push(value);
            console.log('value ' + value + ' is not valid')
            calculateContinuousSet(value);
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

fs.readFile("9/2.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        transformProgram(data);
    }
})