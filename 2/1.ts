import { Observable } from 'rxjs';
import * as fs from 'fs'


// Creation
const observable = new Observable((observer) => {
    fs.readFile("2/1.txt", 'utf8', function(err, data) {
        if (err) {
            observer.error(err)
        } else {
            observer.next(data)
        }
    })
});

// Usage

const nextFunc = (value) => {
    console.log("Got values: \n" + value);
}

const errorFunc = (error) => {
    console.log("Caught error: " + error);
}
const completeFunc = () => {
    console.log("Completed");
}
observable.subscribe(nextFunc, errorFunc, completeFunc);