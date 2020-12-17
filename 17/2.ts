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

let cube:string[][][][] = []

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

const getActiveNeighbours = (cube:string[][][][], wPos:number, zPos:number, yPos:number, xPos:number) => {
    let activeNeightbours = 0;
    for (let w=wPos-1;w<=wPos+1;w++) {
        if (cube[w] == undefined) {
            continue;
        }
        for (let z=zPos-1;z<=zPos+1;z++) {
            if (cube[w][z] == undefined) {
                continue;
            }
            for (let y=yPos-1;y<=yPos+1;y++) {
                if (cube[w][z][y] == undefined) {
                    continue;
                }
                for (let x=xPos-1;x<=xPos+1;x++) {
                    if (cube[w][z][y][x] == undefined) {
                        continue;
                    }
                    if (w == wPos && z == zPos && y == yPos && x == xPos) {
                        continue;
                    }
                    if (cube[w][z][y][x] == '#') {
                        activeNeightbours++;
                    }
                }
            }
        }
    }
    return activeNeightbours;
}

const clone = (cube:string[][][][]) => {
    let cubeCopy:string[][][][] = [];
    for (let w=0;w<cube.length;w++) {
        let square3:string[][][] = []
        for (let z=0;z<cube[w].length;z++) {
            let square:string[][] = []
            for (let y=0;y<cube[w][z].length;y++) {
                let row:string[] = [];
                for (let x=0;x<cube[w][z][y].length;x++) {
                    row.push(cube[w][z][y][x])
                }
                square.push(row);
            }
            square3.push(square)
        }
        cubeCopy.push(square3)
    }
    return cubeCopy;
}

const newCycleOf = async(cube:string[][][][]): Promise<string[][][][]> => {
    return new Promise<string[][][][]>((resolve) => {
        //grow cube by 1
        cube.forEach(c=> {
            c.forEach(s=> {
                s.forEach(r => {
                    r.unshift('.')
                    r.push('.')
                })
                s.unshift(s[0].map(()=>'.'))
                s.push(s[0].map(()=>'.'))
            })
            c.unshift(c[0].map(r=> r.map(()=>'.')))
            c.push(c[0].map(r=> r.map(()=>'.')))
        })
        cube.unshift(cube[0].map(s=> s.map((r)=>r.map(() => '.'))))
        cube.push(cube[0].map(s=> s.map((r)=>r.map(() => '.'))))

        let cubeV2 = clone(cube);

        let wDepth = cube.length;
        let zDepth = cube[0].length;
        let yDepth = cube[0][0].length;
        let xDepth = cube[0][0][0].length;

        // console.log('depth z:' + zDepth + ' y:' + yDepth + ' x:' + xDepth)

        for (let w=0;w<wDepth;w++) {
            for (let z=0;z<zDepth;z++) {
                for (let y=0;y<yDepth;y++) {
                    for (let x=0;x<xDepth;x++) {
                        let activeNeighbours = getActiveNeighbours(cube, w, z, y, x)
                        // console.log('pos ' + z + ' ' + y + ' ' + x + ' has ' + activeNeighbours + ' active neighbours')
                        if (cube[w][z][y][x] == '.' && activeNeighbours == 3) {
                            cubeV2[w][z][y][x] = '#'
                        } else if (cube[w][z][y][x] == '#' && !(activeNeighbours == 2 || activeNeighbours == 3)) {
                            cubeV2[w][z][y][x] = '.'
                        }
                    }
                }
            }
        }
        resolve(cubeV2)
    })
}

const solveProgram = async(): Promise<number> => {
    let square:string[][] = await readFile('17/2.txt');
    let c:string[][][] = []
    c.push(square)
    cube.push(c)

    let attempts = 0;
    let maxAttempts = 6;
    do {
        cube = await newCycleOf(cube);
        attempts++;
    }
    while (attempts < maxAttempts)

    let total = 0;
    cube.forEach(c=> {
        c.forEach(s=> {
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
    })
    return total;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})