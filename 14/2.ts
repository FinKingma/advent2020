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

const readFile = async(file:string): Promise<string[]> => {
    return new Promise<string[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                resolve(data.split('\n'))
            }
        })
    })
}

const createFullSizeBit = (value:number) => {
    let memoryAsBit = value.toString(2);
    let missingBits = 36 - memoryAsBit.length
    for (let i =0;i<missingBits;i++) {
        memoryAsBit = '0' + memoryAsBit
    }
    return memoryAsBit;
}

const updateAddressWithMask = (addressAsBit:string, mask:string) => {
    let addressAsBitArray = addressAsBit.split('')
    for (let y=0;y<mask.length;y++) {
        if (mask[y] != '0') {
            addressAsBitArray[y] = mask[y]
        }
    }
    return addressAsBitArray.join('');
}

const getValuesFromAddress = (address:string) => {
    let numbers:number[]=[]

    console.log('address: ' + address);
    // var regex = new RegExp('^X$');

    let memoryAddresses:string[][] = []
    for (let i=0;i<address.length;i++) {
        if (address[i] != 'X') {
            if (memoryAddresses.length == 0) {
                memoryAddresses.push([address[i]])
            } else {
                memoryAddresses.forEach(add => add.push(address[i]))
            }
        } else {
            if (memoryAddresses.length == 0) {
                memoryAddresses.push(['0'])
                memoryAddresses.push(['1'])
            } else {

                memoryAddresses.forEach(add => {
                    let temp = add.map(a=>a)
                    temp.push('0')
                    memoryAddresses.push(temp)
                    add.push('1')
                })
            }
        }
    }

    memoryAddresses.forEach(a => {
        numbers.push(parseInt(a.join(''),2));
    })
    return numbers;
}

const calculateAddresses = (result:string[]) => {
    return new Promise<number>((resolve) => {
        let mask;
        let values:number[] = []
        for (let row of result) {
            if (row.startsWith('mask')) {
                mask = row.split('mask = ')[1]
            } else {
                let res = MEMREG.exec(row)
                let addressAsBit = createFullSizeBit(+res[1])
                let updatedAddressAsBit = updateAddressWithMask(addressAsBit, mask)
                let addresses:number[] = getValuesFromAddress(updatedAddressAsBit);
                for (let address of addresses) {
                    console.log('address: ' + address)
                    values[address] = +res[2]
                }
            }
        }
        let total = 0;
        for (let index in values) {
            console.log('added val: ' + values[index])
            total+= values[index]
        }
        resolve(total)
    })
}

const solveProgram = async(): Promise<number> => {
    let result:string[] = await readFile('14/2.txt');
    return calculateAddresses(result);
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})