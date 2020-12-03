import { Observable } from 'rxjs';
import * as fs from 'fs'

let slopes:[number, number, number][] = [
    [1,1,null], 
    [3,1,null],
    [5,1,null],
    [7,1,null],
    [1,2,null]
];

var calculateSlope = (data, slope) => {
    return new Promise(function(resolve, reject) {
        let rows = data.split('\n');
        let posX = 0
        let posY = 0
        let gridWidth = rows[0].length
        let trees = 0
        do {
            posX+=slope[1]
            posY+=slope[0]
    
            if (rows[posX]) {
                if (rows[posX][posY%gridWidth] === '#') {
                    trees++
                }
            } else {
                resolve(trees)
            }
        }
        while (posX <= rows.length)
    });
}

const allSlopesAreFilled = () => {
    let filled = true
    for (let slope of slopes) {
        if (!slope[2]) {
            filled = false
        }
    }
    return filled;
}

const calculateAnswer = () => {
    let answer = 1
    for (let slope of slopes) {
        answer *= slope[2]
    }
    console.log('the answer is: ' + answer)
}

fs.readFile("3/2.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        for (let slope of slopes) {
            calculateSlope(data, slope).then((res) => {
                slope[2] = +res
                if (allSlopesAreFilled()) {
                    calculateAnswer()
                }
            }).catch((err) => {
                console.log('something went wrong: ' + err)
            })
        }
    }
})