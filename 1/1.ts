import fs from 'fs'
// const util = require('util');
// import util from 'util'

// const readFile = util.promisify(fs.readFile);

// function solvePuzzle() {
//     return readFile('1.txt');
// }

// solvePuzzle().then(data => {
//     console.log('test')
//     console.log(data);
// })



const promise = new Promise((resolve, reject) => {
    fs.readFile("1/1.txt", 'utf8', function(err, data) {
        if (err) {
            reject(err)
        } else {
            setTimeout(function() {
                resolve(data)
            }, 1000);
        }
    })
});

promise.then((res) => {
    console.log('I get called:', res); // I get called: true

}).catch((err) => {
    console.log('AHHH ERROR' + err);
});