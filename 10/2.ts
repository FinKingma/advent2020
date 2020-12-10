import * as fs from 'fs'
import { Observable } from 'rxjs';

let numbers:number[] = [];
let amountOfNumbers:number=-1;

let maxJoltDifference = 3;
let builtInAdapterDifference = 3;
let dinstinctWays = 1;
let successiveFinds = 0;
let multiplyMapper = new Map([
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 4],
    [5, 7]
]); 

const calculateJolts = () => {
    for (let i = 0;i<=Math.max(...numbers);i++) {
        console.log('finding number ' + i + ' | ' + numbers.indexOf(i))
        if (numbers.indexOf(i) != -1) {
            successiveFinds++;
        } else {
            if (multiplyMapper.has(successiveFinds)) {
                dinstinctWays *= multiplyMapper.get(successiveFinds)
                console.log('found serie that multiplies with ' + multiplyMapper.get(successiveFinds))
            } else {
                console.log('mapper does not have value for ' + successiveFinds)
            }
            successiveFinds = 0
        }
    }
    console.log('found serie that multiplies with ' + multiplyMapper.get(successiveFinds))
    dinstinctWays *= multiplyMapper.get(successiveFinds)
    console.log('found ways ' + dinstinctWays)
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
        numbers.push(+value);
        if (amountOfNumbers === numbers.length) {
            numbers.push(0)
            numbers.sort((a,b) => { return a - b})
            console.log('numbers in order: ' + numbers)
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

fs.readFile("10/2.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        transformProgram(data);
    }
})