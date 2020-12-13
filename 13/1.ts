import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class Schedule {
    earliestDepart: number;
    busIds: number[];
}

const readFile = async(file:string): Promise<Schedule> => {
    return new Promise<Schedule>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let schedule:Schedule = new Schedule();
                let rows = data.split('\n')
                schedule.earliestDepart = +rows[0];
                schedule.busIds = rows[1].split(',').filter(i=> i != 'x').map(i=>+i);
                resolve(schedule)
            }
        })
    })
}

const calculateBusSchedule = (schedule:Schedule) => {
    let found = false;
    let currentMin = schedule.earliestDepart;
    do {
        for (let busId of schedule.busIds) {
            if (currentMin % busId == 0) {
                console.log('bus ' + busId + ' after ' + (currentMin - schedule.earliestDepart) + ' minutes');
                found = true;
                return busId * (currentMin - schedule.earliestDepart);
            }
        }
        currentMin++;
    }
    while (!found)
}

const solveProgram = async(): Promise<number> => {
    let schedule:Schedule = await readFile('13/1.txt');
    return calculateBusSchedule(schedule);
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})