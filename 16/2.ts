import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class TicketTranslation {
    rules: string[] = [];
    rulesFull: string[] = [];
    ticketGroups: number[][] = [];
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
                        ticketTranslation.rulesFull.push(row)
                        let array
                        while ((array = REGEXP.exec(row)) !== null) {
                            ticketTranslation.rules.push(array[1]);
                        }
                    } else if (row.indexOf('ticket') == -1 && row != '') {
                        let ticketGroup:number[] = row.split(',').map(t=>+t);
                        ticketTranslation.ticketGroups.push(ticketGroup)
                    }
                }
                resolve(ticketTranslation)
            }
        })
    })
}

const getValidTickets = async(ticketTranslation: TicketTranslation): Promise<number[][]> => {
    let validTickets:number[][] = []
    ticketCollection: for (let ticketGroup of ticketTranslation.ticketGroups) {
        let numberOfValidTickets = 0;
        ticketGroup: for (let ticket of ticketGroup) {
            for (let rule of ticketTranslation.rules) {
                
                let min = +rule.split('-')[0]
                let max = +rule.split('-')[1]
                // console.log('checking ticket ' + ticket + ' is between ' + min + ' and ' + max + ' res: ' + (ticket >= min && ticket <= max))
                if (ticket >= min && ticket <= max) {
                    numberOfValidTickets++;
                    continue ticketGroup;
                }
            }
        }
        if (numberOfValidTickets == ticketGroup.length) {
            // console.log('ticket group ' + ticketGroup + ' is valid')
            validTickets.push(ticketGroup)
        }

    }
    return validTickets
}

let REGEXP_FULLRULE = RegExp('(.+): (\\d+)-(\\d+) or (\\d+)-(\\d+)', 'g');
const solveProgram = async(): Promise<number> => {
    let ticketTranslation:TicketTranslation = await readFile('16/2.txt');
    let validTickets = await getValidTickets(ticketTranslation)

    let amountOfNumbers = validTickets[0].length

    let numbersWithDeparture:number[] = []
    let validRulesForTickets:string[][] = []

    for (let i=0;i<amountOfNumbers;i++) {
        let validRulesForTicket:string[] = []
        for (let ruleFull of ticketTranslation.rulesFull) {
            let res = /(.+): (.+)-(.+) or (.+)-(.+)/g.exec(ruleFull);

            let ruleName = res[1]
            let min1 = +res[2]
            let max1 = +res[3]
            let min2 = +res[4]
            let max2 = +res[5]
            // console.log('rule: ' + ruleName + ' between ' + min1 + ' and ' + max1 + ' or ' + min2 + ' and ' + max2)
            
            // console.log('amount of numbers per ticket ' + amountOfNumbers)
        
            let amountOfValidTickets = 0
            // console.log('checking if ticket ' + i + ' abides by rule ' + ruleName)
            for (let ticketGroup of validTickets) {
                let value = ticketGroup[i]
                // console.log('checking ' + value)
                if ((value >= min1 && value <= max1) || (value >= min2 && value <= max2)) {
                    amountOfValidTickets++
                }
            }
            if (amountOfValidTickets >= validTickets.length) {
                console.log('ticket ' + i + ' abides by rule ' + ruleName)
                validRulesForTicket.push(ruleName)
            }
        }
        validRulesForTickets[i] = validRulesForTicket
        console.log('no valid rule found for number ' + i + ' on tickets')
    }
    validRulesForTickets.forEach((p,i) => console.log('ticket group ' + i + ' abides by the rules: ' + p))
    let attempts = 0;
    do {
        for (let i=0;i<validRulesForTickets.length;i++) {
            if (validRulesForTickets[i].length == 1) {
                console.log('ticket ' + i + ' must be rule ' + validRulesForTickets[i])
                if (validRulesForTickets[i][0].startsWith('departure')) {
                    numbersWithDeparture.push(validTickets[0][i])
                }
                validRulesForTickets = removeAllOccurancesOfRule(validRulesForTickets, validRulesForTickets[i][0])
            }
        }
        attempts++;
    }
    while (attempts < 20)
    // validRulesForTickets.forEach((p,i) => console.log('ticket group ' + i + ' abides by the rules: ' + p))
    let total = 1
    numbersWithDeparture.forEach(n => total *= n)

    console.log('departures: ' + numbersWithDeparture)
    return total;
}

const removeAllOccurancesOfRule = (validRulesForTickets:string[][], ruleName:string) => {
    for (let j=0;j<validRulesForTickets.length;j++) {
        let occurance = validRulesForTickets[j].indexOf(ruleName);
        if (occurance != -1) {
            validRulesForTickets[j].splice(occurance, 1)
        }
    }
    return validRulesForTickets
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})