import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

// let seats:number[][] = [];

// var transformProgram = (data) => {
//     const promise = new Promise((resolve, reject) => {
//         let rows = data.split('\n');
//         for (let row of rows) {
//             let seatRow
//         }
//     }).then((res) => {

//     }).catch((err) => {
//         console.log('arrgg something happened');
//     })
// }

const readFile = async(file:string): Promise<string[][]> => {
    return new Promise<string[][]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let seats:string[][] = []
                let rows = data.split('\n')
                for (let row of rows) {
                    seats.push(row.split(''))
                }
                resolve(seats)
            }
        })
    })
}

enum SeatEnum {
    EMPTY = 'L',
    OCCUPIED = '#',
    FLOOR = '.'
}
const emptyWithoutOccupiedSeatsAdjacent = (seats, x, y) => {
    if (seats[x][y] == SeatEnum.EMPTY) {
        for (let x1 = x-1; x1 <= x+1; x1++) {
            for (let y1 = y-1; y1 <= y+1; y1++) {
                if (x1 === x && y1 === y) {
                    continue;
                }
                if (seats[x1] && seats[x1][y1] && seats[x1][y1] == SeatEnum.OCCUPIED) {
                    return false;
                }
            }        
        }
        return true;
    }
    return false;
}

const occupiedWithAtLeastFourOccupied = (seats, x, y) => {
    if (seats[x][y] == SeatEnum.OCCUPIED) {
        let amountOccupied = 0;
        for (let x1 = x-1; x1 <= x+1; x1++) {
            for (let y1 = y-1; y1 <= y+1; y1++) {
                if (x1 === x && y1 === y) {
                    continue;
                }
                if (seats[x1] && seats[x1][y1] && seats[x1][y1] == SeatEnum.OCCUPIED) {
                    amountOccupied++;
                }
            }
        }
        return amountOccupied >= 4;
    }
    return false;
}

const cloneSeats = (seats:string[][]) => {
    let newSeats:string[][] = []
    for (let row of seats) {
        let newRow:string[] = []
        for (let seat of row) {
            newRow.push(seat);
        }
        newSeats.push(newRow);
    }
    return newSeats;
}

const updateSeats = async(seats:string[][]): Promise<string[][]> => {
    return new Promise<string[][]>((resolve) => {
        let newSeats = cloneSeats(seats);

        for (let x=0;x<seats.length;x++) {
            for (let y=0;y<seats[x].length;y++) {
                if (emptyWithoutOccupiedSeatsAdjacent(seats, x, y)) {
                    newSeats[x][y] = SeatEnum.OCCUPIED;
                } else if (occupiedWithAtLeastFourOccupied(seats, x, y)) {
                    newSeats[x][y] = SeatEnum.EMPTY;
                }
            }
        }
        resolve(newSeats)
    })
}

const calculateOccupiedSeats = (seats:string[][]) => {
    let occupiedSeats = 0;
    for (let x=0;x<seats.length;x++) {
        for (let y=0;y<seats[x].length;y++) {
            if (seats[x][y] === SeatEnum.OCCUPIED) {
                occupiedSeats++;
            }
        }
    }
    return occupiedSeats;
}

const seatsAreDifferent = (seats:string[][], newSeats:string[][]) => {
    for (let x=0;x<seats.length;x++) {
        for (let y=0;y<seats[x].length;y++) {
            if (seats[x][y] != newSeats[x][y]) {
                return true;
            }
        }
    }
    return false;
}

const solveProgram = async(): Promise<number> => {
    let seats:string[][] = await readFile('11/1.txt');
    let previousSeats:string[][] = []
    let attempts = 0;
    do {
        attempts++;
        previousSeats = cloneSeats(seats);
        seats = await updateSeats(previousSeats)
        console.log('still different after attempt: ' + attempts)
    } while (seatsAreDifferent(seats, previousSeats))

    return calculateOccupiedSeats(seats);
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})