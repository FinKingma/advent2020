import * as fs from 'fs'
import { Observable } from 'rxjs';

let seatIds:number[] = [];
let seats:number = -1;

var calculateHighestSeatId = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n');
        seats = rows.length
        for (let row of rows) {
            let rowPartition = row.substring(0,7).split('F').join(0).split('B').join(1);
            let rowSeat = parseInt(rowPartition, 2);
            console.log('row partition: ' + rowPartition + ' becomes row: ' + rowSeat)

            let columnPartition = row.substring(7,10).split('L').join(0).split('R').join(1);
            let columnSeat = parseInt(columnPartition, 2)
            console.log('column partition: ' + columnPartition + ' becomes col: ' + columnSeat)

            let uniqueSeatId = (rowSeat * 8) + columnSeat;
            observer.next(uniqueSeatId)
        }
    })

    const nextFunc = (value) => {
        console.log('got new seat id: ' + value)
        seatIds.push(value);
        if (seatIds.length == seats) {
            console.log('highest seat id: ' + Math.max(...seatIds))
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

fs.readFile("5/1.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        calculateHighestSeatId(data);
    }
})