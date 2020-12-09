import * as fs from 'fs'
import { Observable } from 'rxjs';

let numbers:number[] = [];
let preamble:number = 25;

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

fs.readFile("9/1.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        transformProgram(data);
    }
})