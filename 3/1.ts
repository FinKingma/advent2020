import { Observable } from 'rxjs';
import * as fs from 'fs'

// Creation
const observable = new Observable((observer) => {
    fs.readFile("3/1.txt", 'utf8', function(err, data) {
        if (err) {
            observer.error(err)
        } else {
            let rows = data.split('\n');
            let posX = 0
            let posY = 0
            let gridWidth = rows[0].length
            do {
                posX++
                posY+=3
                observer.next(rows[posX][posY%gridWidth])
            }
            while (posX < rows.length-1)
        }
    })
});

// Usage
let trees = 0
const nextFunc = (value) => {
    if (value === '#') {
        trees++
    }
    console.log('got trees: ' + trees)
}

const errorFunc = (error) => {
    console.log("Caught error: " + error);
}
const completeFunc = () => {
    console.log("Completed");
}
observable.subscribe(nextFunc, errorFunc, completeFunc);