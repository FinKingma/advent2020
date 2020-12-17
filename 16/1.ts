import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class TicketTranslation {
    rules: string[] = [];
    tickets: number[] = [];
}

let REGEXP = RegExp('(\\d+-\\d+)', 'g');

const readFile = async(file:string): Promise<TicketTranslation> => {
    return new Promise<TicketTranslation>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let rows = data.split('\n')
                let ticketTranslation = new TicketTranslation();
                let foundRules = false;
                for (let row of rows)  {
                    if (row == '' && foundRules == false) {
                        foundRules = true
                    }
                    if (!foundRules) {
                        let array
                        while ((array = REGEXP.exec(row)) !== null) {
                            ticketTranslation.rules.push(array[1]);
                        }
                    } else if (row.indexOf('ticket') == -1 && row != '') {
                        ticketTranslation.tickets.push(...row.split(',').map(t=>+t))
                    }
                }
                resolve(ticketTranslation)
            }
        })
    })
}

const solveProgram = async(): Promise<number> => {
    let ticketTranslation:TicketTranslation = await readFile('16/1.txt');
    // console.log('starting with tickets: ' + ticketTranslation.tickets)
    let illegalTickets:number[] = []
    ticketGroup: for (let ticket of ticketTranslation.tickets) {
        // console.log('checking ticket ' + ticket)
        for (let rule of ticketTranslation.rules) {
            // console.log('against rule: ' + rule)
            
            let min = +rule.split('-')[0]
            let max = +rule.split('-')[1]
            // console.log('checking ticket ' + ticket + ' is between ' + min + ' and ' + max + ' res: ' + (ticket >= min && ticket <= max))
            if (ticket >= min && ticket <= max) {
                continue ticketGroup;
            }
        }
        console.log('ticket: ' + ticket + ' did not abide by any rule')
        illegalTickets.push(ticket)
    }
    // ticketTranslation.rules.forEach(r => console.log('rule: ' + r))
    let total = 0;
    illegalTickets.forEach(t=> total+= t)
    return total;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})