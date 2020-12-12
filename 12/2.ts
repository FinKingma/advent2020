import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

class Action {
    direction: string;
    amount: number;
}

class Ship {
    direction: number;
    north: number;
    east: number;
    waypointNorth:number;
    waypointEast:number

    constructor() {
        this.direction = 90;
        this.north = 0;
        this.east = 0;
        this.waypointNorth = 1;
        this.waypointEast = 10;
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
            ship.waypointNorth += action.amount;
            return ship
        case ShipDirections.EAST:
            ship.waypointEast += action.amount;
            return ship
        case ShipDirections.SOUTH:
            ship.waypointNorth -= action.amount;
            return ship
        case ShipDirections.WEST:
            ship.waypointEast -= action.amount;
            return ship;
        case ShipDirections.FORWARD:
            return updateShipBasedOnWaypoint(ship, action);
        case ShipDirections.LEFT:
            return moveWayPoint(ship, action, ShipDirections.LEFT);
        case ShipDirections.RIGHT:
            return moveWayPoint(ship, action, ShipDirections.RIGHT);
        default:
            throw new Error('action not found ' + action)

    }
}

const moveWayPoint = (ship:Ship, action:Action, direction:string) => {
    if (direction == ShipDirections.LEFT) {
        do {
            ship = moveWayPointLeft(ship)
            action.amount -= 90
        }
        while (action.amount > 0)
    } else if (direction == ShipDirections.RIGHT) {
        do {
            ship = moveWayPointRight(ship)
            action.amount -= 90
        }
        while (action.amount > 0)
    }
    return ship;
}

const moveWayPointRight = (ship:Ship) => {
    let tempEast = ship.waypointEast
    ship.waypointEast = ship.waypointNorth;
    ship.waypointNorth = -tempEast
    return ship;
}

const moveWayPointLeft = (ship:Ship) => {
    let tempNorth = ship.waypointNorth
    ship.waypointNorth = ship.waypointEast;
    ship.waypointEast = -tempNorth
    return ship;
}

const updateShipBasedOnWaypoint = (ship:Ship, action:Action) => {
    for (let i=0;i<action.amount;i++) {
        ship.north+= ship.waypointNorth;
        ship.east+= ship.waypointEast;
    }
    return ship;
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
    let actions:Action[] = await readFile('12/2.txt');
    return calculateShipNavigation(actions);
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})