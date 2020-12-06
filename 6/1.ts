import * as fs from 'fs'
import { Observable } from 'rxjs';

let groupCounts:number[] = [];
let groups:number = -1;

var calculateSumCountsOfGroups = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n\n');
        groups = rows.length
        for (let row of rows) {
            let chars = row.split('\n').join('').split('');
            let unique = [...new Set(chars)]
            observer.next(unique.length)
        }
    })

    const nextFunc = (value) => {
        console.log('got new seat id: ' + value)
        groupCounts.push(value)
        let sum = 0;
        for (let value of groupCounts) {
            sum+= value;
        }
        console.log('total is: ' + sum)
    }
    
    const errorFunc = (error) => {
        console.log("Caught error: " + error);
    }
    const completeFunc = () => {
        console.log("Completed");
    }
    observable.subscribe(nextFunc, errorFunc, completeFunc);
};

fs.readFile("6/1.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        calculateSumCountsOfGroups(data);
    }
})