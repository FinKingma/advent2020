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

const playGame = async(playerCards:PlayerCards) => {
    let attempts = 0;
    //play game
    do {
        //play round
        if (playerCards.player1[0] > playerCards.player2[0]) {
            //player 1 wins round
            playerCards.player1.push(playerCards.player1[0])
            playerCards.player1.push(playerCards.player2[0])
        } else {
            //player 2 wins round
            playerCards.player2.push(playerCards.player2[0])
            playerCards.player2.push(playerCards.player1[0])
        }
        playerCards.player1.splice(0,1)
        playerCards.player2.splice(0,1)
        attempts++;
    }
    while (playerCards.player1.length > 0 && playerCards.player2.length > 0)

    return playerCards;
}

const solveProgram = async(): Promise<number> => {
    let playerCards:PlayerCards = await readFile('22/1.txt');
    // console.log('p1: ' + playerCards.player1)
    // console.log('p2: ' + playerCards.player2)

    playerCards = await playGame(playerCards)

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