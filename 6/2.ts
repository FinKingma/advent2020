import * as fs from 'fs'
import { Observable } from 'rxjs';

let groupCounts:number[] = [];
let groups:number = -1;

var calculateSumCountsOfGroups = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n\n');
        groups = rows.length
        for (let row of rows) {
            let sameAnswers = 0
            let persons = row.split('\n');
            let firstAnswers = persons[0].split('');
            for (let firstAnswer of firstAnswers) {
                let allHaveAnswer = true
                for (let person of persons) {
                    if (person.indexOf(firstAnswer) === -1) {
                        allHaveAnswer = false
                    }
                }
                if (allHaveAnswer) {
                    console.log('group has answered the same for: ' + firstAnswer)
                    sameAnswers++
                }
            }
            observer.next(sameAnswers)
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

fs.readFile("6/2.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        calculateSumCountsOfGroups(data);
    }
})