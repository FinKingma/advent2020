import { Observable } from 'rxjs';
import * as fs from 'fs'

const regexp: RegExp = /(\d*)-(\d*)\s([a-zA-Z]):\s(.+)/;

// Creation
const observable = new Observable((observer) => {
    fs.readFile("2/2.txt", 'utf8', function(err, data) {
        if (err) {
            observer.error(err)
        } else {
            let rows = data.split('\n');
            for (let row of rows) {
                const rowReg = row.match(regexp);
                const posA = rowReg[1]
                const posB = rowReg[2]
                const char = rowReg[3]
                const pw = rowReg[4]
                
                const charAtA = pw[+posA - 1]
                const charAtB = pw[+posB - 1]

                // console.log(row)
                // console.log(charAtA)

                if (charAtA === charAtB) {
                    // console.log('chars are same')
                    continue
                }

                if (charAtA === char || charAtB === char) {
                    // console.log('found valid pw! ' + row)
                    observer.next(pw)
                }

                // console.log('occured: ' + occurances);
                // if (occurances >= +min && occurances <= +max) {
                //     observer.next(pw)
                // }
                
            }
        }
    })
});

// Usage
let valids = 0
const nextFunc = (value) => {
    console.log("Got value: \n" + value);
    valids++;
    console.log('total valid: ' + valids)
}

const errorFunc = (error) => {
    console.log("Caught error: " + error);
}
const completeFunc = () => {
    console.log("Completed");
}
observable.subscribe(nextFunc, errorFunc, completeFunc);