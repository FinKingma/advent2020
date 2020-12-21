import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

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

class GroceryList {
    items:GroceryRow[] = []
}

class GroceryRow {
    ingredients:string[] = []
    allergens:string[] = []
}

let regexp = new RegExp('(\\a+) ', 'g')
const solveProgram = async(): Promise<number> => {
    let ingredientList:string[] = await readFile('21/1.txt');

    let groceryList:GroceryList = new GroceryList();
    let allergenLists:Map<string, string[]> = new Map();

    for (let row of ingredientList) {
        let res = row.replace(')','').split(' (')
        let ingredients = res[0]
        let allergens = res[1].split(', ').map(a=>a.replace('contains','').trim())
        let groceryRow = new GroceryRow();
        groceryRow.allergens = allergens;
        groceryRow.ingredients = ingredients.split(' ');
        groceryList.items.push(groceryRow)

        for (let allergen of allergens) {
            if (allergenLists.has(allergen)) {
                let existingIngredients = allergenLists.get(allergen)
                existingIngredients.push(ingredients)
                allergenLists.set(allergen, existingIngredients)
            } else {
                allergenLists.set(allergen, [ingredients])
            }
        }
    }

    let allergensCandidates:Map<string, string[]> = new Map();
    for (let [key,value] of allergenLists) {
        let ingredients = value[0].split(' ')
        for (let y=0;y<ingredients.length;y++) {
            let ingredientToCheck = ingredients[y]

            let occursInAllLists = true;
            for (let z=1;z<value.length;z++) {
                if (value[z].indexOf(ingredientToCheck) == -1) {
                    occursInAllLists = false
                }
            }
            if (occursInAllLists) {
                if (allergensCandidates.has(key)) {
                    allergensCandidates.get(key).push(ingredientToCheck)
                } else {
                    allergensCandidates.set(key, [ingredientToCheck])
                }
            }
        }
    }

    allergensCandidates.forEach((i,k) => {
        console.log(k + ': ' + i)
    })

    let safeOccurances=0;

    for (let item of groceryList.items) {
        for (let ingredient of item.ingredients) {
            let isAllergenIngredient = false;
            allergensCandidates.forEach(v => {
                v.forEach(i => {
                    if (i==ingredient) {
                        isAllergenIngredient = true;
                    }
                })
            })
            if (!isAllergenIngredient) {
                console.log('ingredient ' + ingredient + ' is safe')
                safeOccurances++;
            }
        }
    }
    
    return safeOccurances;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})