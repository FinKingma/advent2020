import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

const readFile = async(file:string): Promise<number[]> => {
    return new Promise<number[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                resolve(data.split('').map(c=>+c))
            }
        })
    })
}

const solveProgram = async(): Promise<number> => {
    let cups:number[] = await readFile('23/2.txt');
    // for (let i=10;i<=1000000;i++) {
    //     cups.push(i)
    // }
    // console.log('cups: ' + cups.length)

    let currentCup = 0
    let currentCupValue = cups[currentCup]
    let maxCupValue = cups.length
    let rounds = 100;

    for (let round=1;round<=rounds;round++) {
        console.log('---------ROUND ' + round + ' --------')
        console.log('cups ' + cups)
        console.log('current cup ' + currentCupValue + ' at i:' + currentCup)
        
        let slicedCups = cups.slice(currentCup+1, currentCup+4)
        cups.splice(currentCup+1, 3)

        if (currentCup+4 > maxCupValue) {
            let additionalCupsToTakeFromFront = currentCup+4 - maxCupValue
            slicedCups.push(...cups.slice(0, additionalCupsToTakeFromFront))
            cups.splice(0, additionalCupsToTakeFromFront)
            currentCup -= additionalCupsToTakeFromFront
        }

        // console.log('cups after slice ' + cups)
        console.log('pickup: ' + slicedCups)

        //find destination cup
        let destinationCup = -1;
        let destinationCupValue = currentCupValue-1;
        do {
            if (slicedCups.indexOf(destinationCupValue) != -1) {
                destinationCupValue--;
            } else if (destinationCupValue < 1) {
                destinationCupValue = maxCupValue;
            } else {
                destinationCup = cups.indexOf(destinationCupValue)
                console.log('destination ' + destinationCupValue + ' at index ' + destinationCup)
            }
        }
        while (destinationCup == -1)

        for (let j=0;j<slicedCups.length;j++) {
            cups.splice(destinationCup+j+1,0, slicedCups[j])
        }

        if (destinationCup < currentCup) {
            //3 items were moved before the currentcup pos, so currentcup needs to move 3 place back
            currentCup+=3
        }

        currentCup++;
        // console.log('cup1: ' + currentCup)
        if (currentCup >= cups.length) {
            currentCup = (currentCup - cups.length)
            // console.log('cup2: ' + currentCup)
        }
        // console.log('new calculated cup i: ' + currentCup)
        currentCupValue = cups[currentCup]
    }

    console.log('final cups ' + cups)

    let indexOfOne;
    cups.forEach((c,i) => 
    { if (c==1) {
        indexOfOne = i
    } })

    let firstPart = cups.slice(indexOfOne+1)
    let lastPart = cups.slice(0, indexOfOne)
    let answer = firstPart.join('') + lastPart.join('')
    return +answer;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})