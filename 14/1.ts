import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class Memory {
    position: number;
    value: number;
}

class BitMask {
    mask: string;
    memories: Memory[] = [];
}

let MEMREG = new RegExp('^mem\\[(.+)\\] = (\\d+)$');

const readFile = async(file:string): Promise<number[]> => {
    return new Promise<number[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let rows = data.split('\n')
                let mask;
                let values:number[] = []
                for (let row of rows) {
                    if (row.startsWith('mask')) {
                        mask = row.split('mask = ')[1]
                    } else {
                        let res = MEMREG.exec(row)
                        let memoryAsBit = (+res[2]).toString(2);
                        let missingBits = mask.length - memoryAsBit.length
                        for (let i =0;i<missingBits;i++) {
                            memoryAsBit = '0' + memoryAsBit
                        }
                        let memoryAsBitArray = memoryAsBit.split('')
                        for (let y=0;y<mask.length;y++) {
                            if (mask[y] != 'X') {
                                memoryAsBitArray[y] = mask[y]
                            }
                        }
                        let newMemoryAsBit = memoryAsBitArray.join('');
                        values[+res[1]] = parseInt(newMemoryAsBit,2)
                    }
                }
                resolve(values)
            }
        })
    })
}

const solveProgram = async(): Promise<number> => {
    let result:number[] = await readFile('14/1.txt');
    let total = 0;
    result.forEach(r => {total += r})
    return total;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})