import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class Action {
    direction: string;
    amount: number;
}

class Ship {
    direction: number; //0=north
    north: number; //north-south
    east: number; //east-west

    constructor() {
        this.direction = 90;
        this.north = 0;
        this.east = 0;
    }
}

const readFile = async(file:string): Promise<Action[]> => {
    return new Promise<Action[]>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let actions:Action[] = []
                let rows = data.split('\n')
                for (let row of rows) {
                    let action = new Action();
                    action.direction = row.substr(0,1);
                    action.amount = +row.substr(1);
                    actions.push(action)
                }
                resolve(actions)
            }
        })
    })
}

enum ShipDirections {
    NORTH = 'N',
    SOUTH = 'S',
    EAST = 'E',
    WEST = 'W',
    LEFT = 'L',
    RIGHT = 'R',
    FORWARD = 'F'
}

const updateShip = (ship:Ship, action:Action) => {
    switch (action.direction) {
        case ShipDirections.NORTH:
            ship.north += action.amount;
            return ship
        case ShipDirections.EAST:
            ship.east += action.amount;
            return ship
        case ShipDirections.SOUTH:
            ship.north -= action.amount;
            return ship
        case ShipDirections.WEST:
            ship.east -= action.amount;
            return ship;
        case ShipDirections.FORWARD:
            return updateShipBasedOnDegrees(ship, action);
        case ShipDirections.LEFT:
            ship.direction -= action.amount;
            return ship;
        case ShipDirections.RIGHT:
            ship.direction += action.amount;
            return ship;
        default:
            throw new Error('action not found ' + action)

    }
}

const updateShipBasedOnDegrees = (ship:Ship, action:Action) => {
    do {
        ship.direction+=360
    }
    while (ship.direction < 0)
    do {
        ship.direction -= 360
    }
    while (ship.direction >= 360)

    switch ((ship.direction+360)%360) {
        case 0:
            ship.north+=action.amount
            return ship;
        case 90:
            ship.east+=action.amount
            return ship;
        case 180:
            ship.north-=action.amount
            return ship;
        case 270:
            ship.east-=action.amount
            return ship;
        default:
            throw new Error ('direction not found ' + ship.direction)
    }
}

const calculateShipNavigation = (actions:Action[]) => {
    let ship = new Ship();
    for (let action of actions) {
        ship = updateShip(ship, action);
    }

    console.log('final n:' + ship.north + ' e:' + ship.east)

    return Math.abs(ship.north) + Math.abs(ship.east);
}

const solveProgram = async(): Promise<number> => {
    let actions:Action[] = await readFile('12/1.txt');
    return calculateShipNavigation(actions);
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})