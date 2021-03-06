import fs from 'fs'

const promise = new Promise((resolve, reject) => {
    fs.readFile("1/1.txt", 'utf8', function(err, data) {
        if (err) {
            reject(err)
        } else {
            let answer = undefined;
            let result = 2020;
            let values = data.split('\n').map(x=>+x);

            for (let i=0;i<values.length;i++) {
                for (let j=0;j<values.length;j++) {
                    if (i != j) {
                        if (values[i] + values[j] === result) {
                            answer = values[i] * values[j]
                            resolve(answer)
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