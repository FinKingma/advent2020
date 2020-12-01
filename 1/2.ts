import fs from 'fs'

const promise = new Promise((resolve, reject) => {
    fs.readFile("1/2.txt", 'utf8', function(err, data) {
        if (err) {
            reject(err)
        } else {
            let answer = undefined;
            let result = 2020;
            let values = data.split('\n').map(x=>+x);

            for (let i=0;i<values.length;i++) {
                for (let j=0;j<values.length;j++) {
                    for (let k=0;k<values.length;k++) {
                        if (i != j && i != k && j != k) {
                            if (values[i] + values[j] + values[k] === result) {
                                answer = values[i] * values[j] * values[k]
                                resolve(answer)
                            }
                        }
                    }
                }
            }
        }
    })
});

promise.then((res) => {
    console.log('I get called:', res); // I get called: true

}).catch((err) => {
    console.log('AHHH ERROR' + err);
});