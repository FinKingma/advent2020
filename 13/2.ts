import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class Bus {
    id:number;
    offset:number;
}

const readFile = async(file:string): Promise<Bus[]> => {
    return new Promise<Bus[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let bussList:Bus[] = []
                let rows = data.split('\n')
                let busses = rows[1].split(',');
                for (let i=0;i<busses.length;i++) {
                    if (busses[i] != 'x') {
                        let bus = new Bus();
                        bus.id = +busses[i]
                        bus.offset = i
                        bussList.push(bus)
                    }
                }
                resolve(bussList)
            }
        })
    })
}

//answer = 807435693182510

const calculateBusSchedule = (busses:Bus[]) => {
    busses.forEach(o => console.log(o.id + ' | ' + o.offset))
    let found = false;
    let timestamp = 0;
    let leaps = 1;
    group: for(let i=0;i<busses.length;i++) {
        found = false
        do {
            if ((timestamp + busses[i].offset) % busses[i].id == 0) {
                console.log('found bus ' + busses[i].id + ' at ' + timestamp)
                leaps = leaps * busses[i].id;
                continue group;
            }
            timestamp += leaps;
        }
        while (!found)
    }
    return timestamp
}

const solveProgram = async(): Promise<number> => {
    let schedule:Bus[] = await readFile('13/2.txt');
    return calculateBusSchedule(schedule);
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})