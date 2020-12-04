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

const isValidValueForField = (field, value) => {
    switch (field) {
        case 'byr': 
            return value.length == 4 && +value >= 1920 && +value <= 2002;
        case 'iyr': 
            return value.length == 4 && +value >= 2010 && +value <= 2020;
        case 'eyr': 
            return value.length == 4 && +value >= 2020 && +value <= 2030;
        case 'hgt': 
            if (value.endsWith('cm')) {
                let height = +value.slice(0,-2);
                return height >= 150 && height <= 193
            } else if (value.endsWith('in')) {
                let height = +value.slice(0,-2);
                return height >= 59 && height <= 76
            } else {
                return false;
            }
        case 'hcl':
            return new RegExp('^#[0-9|a-f]{6}$').test(value);
        case 'ecl':
            return ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].indexOf(value) != -1
        case 'pid':
            return new RegExp('^[0-9]{9}$').test(value)
        default:
            throw new Error('field ' + field + ' not implemented')
    }
}

var calculateValidPasswords = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n\n');
        for (let row of rows) {
            let isValid = true;
            for (let field of requiredFields) {
                if (row.indexOf(field + ':') == -1) {
                    isValid = false;
                    break;
                } else {
                    const regex = RegExp(field + ':([^\\s]+)', 'g');
                    const value = regex.exec(row)[1];
                    isValid = isValidValueForField(field, value);
                    console.log('field ' + field + ' with value ' + value + ' is valid:' + isValid)
                    if (!isValid) {
                        break;
                    }
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

fs.readFile("4/2.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        calculateValidPasswords(data);
    }
})