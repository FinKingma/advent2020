import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

/*

If a cube is active and exactly 2 or 3 of its neighbors are also active, the cube remains active. Otherwise, the cube becomes inactive.
If a cube is inactive but exactly 3 of its neighbors are active, the cube becomes active. Otherwise, the cube remains inactive.

.#.
..#
###

...
#.#
.##
.#.

*/

let cube:string[][][] = []

const readFile = async(file:string): Promise<string[][]> => {
    return new Promise<string[][]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let rows = data.split('\n')
                let square:string[][] = [];
                for (let row of rows) {
                    square.push(row.split('').map(c=>c))
                }
                resolve(square)
            }
        })
    })
}

const getActiveNeighbours = (cube:string[][][], zPos:number, yPos:number, xPos:number) => {
    let activeNeightbours = 0;
    for (let z=zPos-1;z<=zPos+1;z++) {
        if (cube[z] == undefined) {
            continue;
        }
        for (let y=yPos-1;y<=yPos+1;y++) {
            if (cube[z][y] == undefined) {
                continue;
            }
            for (let x=xPos-1;x<=xPos+1;x++) {
                if (cube[z][y][x] == undefined) {
                    continue;
                }
                if (z == zPos && y == yPos && x == xPos) {
                    continue;
                }
                if (cube[z][y][x] == '#') {
                    // console.log('found an active neighbour for ' + zPos + ' ' + yPos + ' ' + xPos)
                    activeNeightbours++;
                }
            }
        }
    }
    return activeNeightbours;
}

const clone = (cube:string[][][]) => {
    let cubeCopy:string[][][] = [];
    for (let z=0;z<cube.length;z++) {
        let square:string[][] = []
        for (let y=0;y<cube[z].length;y++) {
            let row:string[] = [];
            for (let x=0;x<cube[z][y].length;x++) {
                row.push(cube[z][y][x])
            }
            square.push(row);
        }
        cubeCopy.push(square)
    }
    return cubeCopy;
}

const newCycleOf = async(cube:string[][][]): Promise<string[][][]> => {
    return new Promise<string[][][]>((resolve) => {
        //grow cube by 1
        cube.forEach(s=> {
            s.forEach(r => {
                r.unshift('.')
                r.push('.')
            })
            s.unshift(s[0].map(()=>'.'))
            s.push(s[0].map(()=>'.'))
        })
        cube.unshift(cube[0].map(r=> r.map(()=>'.')))
        cube.push(cube[0].map(r=> r.map(()=>'.')))

        let cubeV2 = clone(cube);

        let zDepth = cube.length;
        let yDepth = cube[0].length;
        let xDepth = cube[0][0].length;

        // console.log('depth z:' + zDepth + ' y:' + yDepth + ' x:' + xDepth)

        for (let z=0;z<zDepth;z++) {
            for (let y=0;y<yDepth;y++) {
                for (let x=0;x<xDepth;x++) {
                    let activeNeighbours = getActiveNeighbours(cube, z, y, x)
                    // console.log('pos ' + z + ' ' + y + ' ' + x + ' has ' + activeNeighbours + ' active neighbours')
                    if (cube[z][y][x] == '.' && activeNeighbours == 3) {
                        cubeV2[z][y][x] = '#'
                    } else if (cube[z][y][x] == '#' && !(activeNeighbours == 2 || activeNeighbours == 3)) {
                        cubeV2[z][y][x] = '.'
                    }
                }
            }
        }
        resolve(cubeV2)
    })
}

const solveProgram = async(): Promise<number> => {
    let square:string[][] = await readFile('17/1.txt');
    cube.push(square)

    let attempts = 0;
    let maxAttempts = 6;
    do {
        cube = await newCycleOf(cube);
        attempts++;
    }
    while (attempts < maxAttempts)

    let total = 0;
    cube.forEach(s=> {
        console.log('\n')
        s.forEach(r=> {
            console.log('r: ' + r.join(''))
            r.forEach(c=> {
                if (c=='#') {
                    total++
                }
            })
        })
    })
    return total;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})