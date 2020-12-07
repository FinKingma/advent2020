import * as fs from 'fs'
import { Observable } from 'rxjs';

class BagWithColors {
    bagColor:string;
    containsColors:string[] = [];
}

let bagsWithColors:BagWithColors[] = [];
let numberOfBags:number = -1;
let approvedBags:string[] = []

var calculateBagsWith = (color) => {
    for (let bag of bagsWithColors) {
        if (bag.containsColors.indexOf(color) != -1) {
            approvedBags.push(bag.bagColor)
            calculateBagsWith(bag.bagColor)
            console.log('result: ' + [...new Set(approvedBags)].length)
        }
    }
}

var calculateBags = (data) => {
    const observable = new Observable((observer) => {
        let rows = data.split('\n');
        numberOfBags = rows.length
        for (let row of rows) {
            let attributes = new RegExp('^(.+) bags contain (.+)').exec(row)

            let bag:BagWithColors = new BagWithColors();
            bag.bagColor = attributes[1];

            if (!attributes[2].endsWith('no other bags.')) {
                let holdGroups = attributes[2].split(',')
                for (let holdGroup of holdGroups) {
                    let holdAttrs = new RegExp('(\\d+) (.+) bags?').exec(holdGroup)
                    bag.containsColors.push(holdAttrs[2])
                }   
            }
            
            observer.next(bag)
        }
    })

    const nextFunc = (value) => {
        console.log('got new bag: ' + value.containsColors)
        bagsWithColors.push(value)
        
        if (bagsWithColors.length === numberOfBags) {
            console.log('got them all')
            calculateBagsWith('shiny gold')
        }
    }
    
    const errorFunc = (error) => {
        console.log("Caught error: " + error);
    }
    const completeFunc = () => {
        console.log("Completed");
    }
    observable.subscribe(nextFunc, errorFunc, completeFunc);
};

fs.readFile("7/1.txt", 'utf8', (err, data) => {
    if (err) {
        console.log('something went wrong: ' + err)
    } else {
        calculateBags(data);
    }
})