import * as fs from 'fs'
import { async, EMPTY, Observable } from 'rxjs';

const readFile = async(file:string): Promise<PlayerCards> => {
    return new Promise<PlayerCards>((resolve) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                throw new Error('something went wrong: ' + err)
            } else {
                let rows = data.split('\n')
                let playerCards:PlayerCards = new PlayerCards();
                let player2Start = false
                for (let row of rows) {
                    if (row.startsWith('Player 2')) {
                        player2Start = true;
                        continue;
                    } else if (row.startsWith('Player 1') || row == '') {
                        continue;
                    }

                    if (!player2Start) {
                        playerCards.player1.push(+row)
                    } else {
                        playerCards.player2.push(+row)
                    }
                }
                resolve(playerCards)
            }
        })
    })
}

class PlayerCards {
    player1:number[] = []
    player2:number[] = []
}

const hasOccuredInThePast = async(history: PlayerCards[], currentHand: PlayerCards) => {
    for (let step of history) {
        if (haveSameValues(step.player1, currentHand.player1) && haveSameValues(step.player2, currentHand.player2)) {
            return true;
        }
    }
    return false;
}

const haveSameValues = (arr1:number[], arr2:number[]) => {

    if (arr1.length != arr2.length) {
        return false;
    }
    for (let i=0;i<arr2.length;i++) {
        if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

const copy = async(playerCards:PlayerCards) => {
    let copy = new PlayerCards();
    copy.player1 = []
    copy.player2 = []
    playerCards.player1.forEach(c => copy.player1.push(c))
    playerCards.player2.forEach(c => copy.player2.push(c))
    return copy;
}

const playGame = async(playerCards:PlayerCards, level:number) => {
    let history:PlayerCards[] = []
    let round = 0;
    //play game
    do {
        round++;
        if (level == 1) {
            console.log(level + ' playing round ' + round)
            console.log(level + ' cards p1:' + playerCards.player1)
            console.log(level + ' cards p2:' + playerCards.player2)
        }
        if (await hasOccuredInThePast(history, playerCards)) {
            if (level == 1) {
                console.log(level + ' infinite loop occured at ' + round)
                console.log(level + ' player 1 automatically wins')
            }
            return playerCards;
        }
        history.push(await copy(playerCards))

        if (playerCards.player1[0] < playerCards.player1.length && playerCards.player2[0] < playerCards.player2.length) {
            if (level == 1) {
                console.log(level + ' playing recursive with cards ' + playerCards.player1[0]  + ' ' + playerCards.player2[0])
            }
            let recursiveCards = await copy(playerCards)
            //remove first card and only keep amount of cards equal to drawn card
            recursiveCards.player1 = recursiveCards.player1.slice(1,playerCards.player1[0]+1)
            recursiveCards.player2 = recursiveCards.player2.slice(1,playerCards.player2[0]+1)

            if (level == 1) {
                console.log(level + ' playing recursive with decks p1:' + recursiveCards.player1 + ' p2:' + recursiveCards.player2)
            }
            recursiveCards = await playGame(recursiveCards, level+1)
            if (recursiveCards.player1.length == 0) {
                if (level == 1) {
                    console.log(level + ' player 2 won recursive game')
                }
                playerCards.player2.push(playerCards.player2[0])
                playerCards.player2.push(playerCards.player1[0])
            } else if (recursiveCards.player2.length == 0) {
                if (level == 1) {
                    console.log(level + ' player 1 won recursive game')
                }
                playerCards.player1.push(playerCards.player1[0])
                playerCards.player1.push(playerCards.player2[0])
            } else {
                if (level == 1) {
                    console.log('p1:' + recursiveCards.player1.length + ' p2:' + recursiveCards.player2.length)
                    console.log(level + ' something weird happened, likely loop discovered, player 1 gets all points')
                }
                playerCards.player1.push(playerCards.player1[0])
                playerCards.player1.push(playerCards.player2[0])
            }
        } else {
            //play normal round
            if (playerCards.player1[0] > playerCards.player2[0]) {
                //player 1 wins round
                playerCards.player1.push(playerCards.player1[0])
                playerCards.player1.push(playerCards.player2[0])
                if (level == 1) {
                    console.log(level + ' player 1 wins round ' + round + ' p1:' + playerCards.player1[0] + ' p2:' + playerCards.player2[0])
                }
            } else {
                //player 2 wins round
                playerCards.player2.push(playerCards.player2[0])
                playerCards.player2.push(playerCards.player1[0])
                if (level == 1) {
                    console.log(level + ' player 2 wins round ' + round + ' p1:' + playerCards.player1[0] + ' p2:' + playerCards.player2[0])
                }
            }
        }
        playerCards.player1.splice(0,1)
        playerCards.player2.splice(0,1)
    }
    while (playerCards.player1.length > 0 && playerCards.player2.length > 0)

    if (level == 1) {
        playerCards.player1.forEach(c=> console.log(c))
    }

    return playerCards;
}

const solveProgram = async(): Promise<number> => {
    let playerCards:PlayerCards = await readFile('22/2.txt');
    // console.log('p1: ' + playerCards.player1)
    // console.log('p2: ' + playerCards.player2)

    playerCards = await playGame(playerCards,1)

    console.log('p1: ' + playerCards.player1)
    console.log('p2: ' + playerCards.player2)

    let winningPlayer = playerCards.player1.length>0 ? playerCards.player1 : playerCards.player2
    let score = 0
    let maxScore = winningPlayer.length;
    for (let i=0;i<winningPlayer.length;i++) {
        score += winningPlayer[i]*(maxScore-i)
    }
    return score;
}

solveProgram().then((answer) => {
    console.log('answer: ' + answer);
}).catch((err) => {
    console.log('something went wrong: ' + err)
})