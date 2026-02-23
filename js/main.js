'use strict'
document.addEventListener('contextmenu', function (event) {
    event.preventDefault()
    return false
})

const MINE = '💣'
const EMPTY = ''
const MARK = '🚩'

var gBoard
var gGame
var gLevel = {
    SIZE: 8,
    MINES: 14
}

function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')

    gGame = createGame()
    gGame.isOn = true
    console.log('gBoard', gBoard)
}

function buildBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = createCell()
            board[i].push(cell)
        }
    }

    // setMinesNegsCount(board)
    return board
}

function createCell() {
    var cell = {
        minesAroundCount: null,
        isRevealed: false,
        isMine: false,
        isMarked: false
    }

    return cell
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) board[i][j].minesAroundCount = 0
            neighborsLoop(board, i, j, updateMineNegs)
        }
    }
}


function updateMineNegs(cell, neighborCell) {
    if (neighborCell.isMine) cell.minesAroundCount++
}

function createGame() {
    const game = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    return game
}

function onCellClicked(i, j, elCell) {
    if (!gGame.isOn) return

    if (gGame.revealedCount === 0 && gGame.markedCount === 0) {
        gBoard[i][j].minesAroundCount = 0
        addMines({ i, j })
        setMinesNegsCount(gBoard)
        expandReveal(gBoard, elCell, i, j)
        renderUpdatedBoard(gBoard)
        return
    }

    if (gBoard[i][j].isRevealed || gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine) {
        revealCell({ i, j })
        gGame.isOn = false
        return
    }

    if (gBoard[i][j].minesAroundCount === 0) {
        expandReveal(gBoard, elCell, i, j)
        checkGameOver()
        return
    }

    revealCell({ i, j })
    checkGameOver()
}

function onCellMarked(i, j, elCell) {
    if (!gGame.isOn) return

    if (gBoard[i][j].isRevealed) return

    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    gGame.markedCount++

    const elMark = elCell.querySelector('.mark')

    if (gBoard[i][j].isMarked) elMark.innerText = MARK
    else elMark.innerText = EMPTY

    elMark.style.display = 'block'

    checkGameOver()
}


function expandReveal(board, elCell, i, j) {
    if (i >= gBoard.length || i < 0 ||
        j >= gBoard[0].length || j < 0 ||
        board[i][j].isMine ||
        board[i][j].isRevealed) {
        return
    } else if (board[i][j].minesAroundCount > 0) {
        revealCell({ i, j })
        return
    }

    revealCell({ i, j })

    expandReveal(board, elCell, i + 1, j)
    expandReveal(board, elCell, i - 1, j)
    expandReveal(board, elCell, i, j + 1)
    expandReveal(board, elCell, i, j - 1)
}


function checkGameOver() {
    console.log('gGame.revealedCount', gGame.revealedCount)
    if (gGame.revealedCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        gGame.isOn = false
        const elGameOver = document.querySelector('.game-over')
        elGameOver.style.display = 'block'
    }

}

function addMines(pos) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randPossibleMinePos = getRandPossibleMinePos(gBoard)
        console.log('randPossibleMinePos', randPossibleMinePos)
        // var distI = Math.abs(randEmptyPos.i - pos.i)
        // var distJ = Math.abs(randEmptyPos.j - pos.j)
        // console.log('randEmptyPos',randEmptyPos)
        // console.log('pos',pos)
        // console.log('distI',distI)
        // console.log('distJ',distJ)

        // while (distI < 1 || distJ < 1) {
        //     randEmptyPos = getRandomEmptyPos()
        //     distI = Math.abs(randEmptyPos.i - pos.i)
        //     distJ = Math.abs(randEmptyPos.j - pos.j)
        // }
        gBoard[randPossibleMinePos.i][randPossibleMinePos.j].isMine = true
    }

}