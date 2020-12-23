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
    let cups:number[] = await readFile('23/1.txt');

    let currentCup = 0
    let currentCupValue = cups[currentCup]
    for (let round=1;round<=101;round++) {
        console.log('--------ROUND ' + round + ' -----------')
        console.log('cups ' + cups)
        console.log('current cup ' + currentCup + ' | ' + currentCupValue)
        
        //slice next three cups
        let slicedCups:number[] = []
        for (let i=0;i<3;i++) {
            let slicedCupIndex = currentCup+1 < cups.length? currentCup+1 : 0;
            slicedCups.push(cups[slicedCupIndex])
            cups.splice(slicedCupIndex, 1)
        }

        console.log('cups after slice ' + cups)
        console.log('sliced ' + slicedCups)

        //find destination cup
        let destinationCup = -1;
        let destinationCupValue = currentCupValue-1;
        if (Math.min(...cups) > destinationCupValue) {
            destinationCupValue = Math.max(...cups)
        } else {
            destinationCupValue = Math.max(...cups.filter(c=> c<=destinationCupValue))
        }

        console.log('des cup: ' + destinationCupValue)
        
        do {
            for (let i=0;i<cups.length;i++) {
                if (cups[i] == destinationCupValue) {
                    destinationCup = i
                    console.log('found destination cup at: ' + destinationCup)
                    for (let j=0;j<slicedCups.length;j++) {
                        cups.splice(destinationCup+j+1,0, slicedCups[j])
                    }
                    break;
                }
            }
            destinationCupValue--;
        }
        while (destinationCup == -1)

        //update current cup
        for (let i=0;i<cups.length;i++) {
            if (cups[i] == currentCupValue) {
                currentCup = i
            }
        }
        currentCup++;
        if (currentCup >= cups.length) {
            currentCup = currentCup - cups.length
        }
        currentCupValue = cups[currentCup]
    }
    
    return 1;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})