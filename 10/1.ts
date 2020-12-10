import * as fs from 'fs'
import { Observable } from 'rxjs';

let numbers:number[] = [];
let amountOfNumbers:number=-1;
let preamble:number = 25;

let effectiveRating=0;
let joltDifferences:number[] = [];
let maxJoltDifference = 3;
let builtInAdapterDifference = 3;

const calculateJolts = () => {
    let complete = false;
    do {
        let validChoices:number[] = [];
        for (let number of numbers) {
            if (number - effectiveRating <= maxJoltDifference && number > effectiveRating) {
                validChoices.push(number);
            }
        }

        if (validChoices.length === 0) {
            joltDifferences.push(builtInAdapterDifference);
            let ones = joltDifferences.filter(x => x==1).length;
            let threes = joltDifferences.filter(x => x==3).length;
            console.log('differences: ' + joltDifferences)
            console.log('result: ' + ones * threes);
            complete = true;
        } else {
            console.log(validChoices);
            let selectedChoice = Math.min(...validChoices)
            joltDifferences.push(Math.abs(effectiveRating - selectedChoice))
            effectiveRating = selectedChoice
        }

    }
    while (!complete)
    

}

var transformProgram = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n');
        amountOfNumbers = rows.length;
        
        for (let row of rows) {
            observer.next(+row)
        }
    })

    const nextFunc = (value) => {
        // console.log('got new instruction: ' + value)
        numbers.push(value);
        if (amountOfNumbers === numbers.length) {
            calculateJolts();
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

fs.readFile("10/1.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        transformProgram(data);
    }
})