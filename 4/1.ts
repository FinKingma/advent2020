import * as fs from 'fs'
import { Observable } from 'rxjs';

const requiredFields = [
    'byr',
    'iyr',
    'eyr',
    'hgt',
    'hcl',
    'ecl',
    'pid'
    // 'cid'
];

let validPassports = 0

var calculateValidPasswords = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n\n');
        for (let row of rows) {
            let isValid = true;
            for (let field of requiredFields) {
                if (row.indexOf(field + ':') == -1) {
                    isValid = false;
                }
            }
            if (isValid) {
                observer.next('passport: ' + row)
            }
        }
    })

    const nextFunc = (value) => {
        console.log('got valid passport: ' + value)
        validPassports++;
        console.log('new total: ' + validPassports);
    }
    
    const errorFunc = (error) => {
        console.log("Caught error: " + error);
    }
    const completeFunc = () => {
        console.log("Completed");
    }
    observable.subscribe(nextFunc, errorFunc, completeFunc);
};

fs.readFile("4/1.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        calculateValidPasswords(data);
    }
})