'use strict'

document.addEventListener('contextmenu', function (event) {
    event.preventDefault()
    return false
})

const MINE = '💣'
const EMPTY = ''
const MARK = '🚩'
const FACE = '🙂'
const HAPPY = '😀'
const DEAD = '😵'
const EXPLOSION = '💥'
const VICTORY = '😎'
const LOSE_LOGO = `<img src="img/game-over-logo.png" alt="">`
const WIN_LOGO = `<img src="img/win-logo.png" alt="">`

const COLORS = {
    '0': 'transparent',
    '1': 'blue',
    '2': 'green',
    '3': 'red',
    '4': 'red',
    '5': 'red',
    '6': 'red',
    '7': 'red',
    '8': 'red',
}

const BEGINNER = { size: 4, mines: 2 }
const MEDIUM = { size: 8, mines: 14 }
const EXPERT = { size: 12, mines: 32 }

var gStopWatchInterval
var gStoredGames
var gScoreBoard
var gStartTime
var gBoard
var gGame

var gSession = {
    fName: null,
    lName: null
}

var gLevel = {
    SIZE: BEGINNER.size,
    MINES: BEGINNER.mines
}

function onInit() {
    gGame = createGame()

    const storedGamesStr = localStorage.getItem(gGame.level)
    gStoredGames = storedGamesStr === null ? [] : JSON.parse(storedGamesStr)
    gStoredGames = bubbleSort(gStoredGames)

    hideGameOverModal()
    renderScoreBoard(gStoredGames, 10)

    showSessionForm()
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')

    gGame.isOn = true
}

function createGame() {
    const game = {
        level: getGameLevel(),
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isWin: false
    }

    return game
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

    return board
}

function buildScoreBoard(sessions) {
    if (!sessions) return null

    var scoreBoard = []

    for (var i = 0; i < sessions.length; i++) {
        var currSession = sessions[i]
        scoreBoard.push([`${currSession.fName}_${currSession.lName}_${currSession.id}`])
        scoreBoard.push([currSession.secsPassed])
    }
    console.log('scoreBoard', scoreBoard)
    return scoreBoard
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

function expandReveal(board, elCell, i, j) {
    if (i >= gBoard.length || i < 0 ||
        j >= gBoard[0].length || j < 0 ||
        board[i][j].isMine ||
        board[i][j].isRevealed ||
        board[i][j].isMarked) {
        return
    } else if (board[i][j].minesAroundCount > 0) {
        revealCell({ i, j })
        return
    }
    updateGameEmoji(HAPPY)
    setTimeout(updateGameEmoji, 1000, FACE);
    revealCell({ i, j })

    expandRevealNegs(board, i, j, elCell)
}

function checkGameOver() {
    if (gGame.revealedCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        gGame.isWin = true
        gGame.isOn = false

        clearInterval(gStopWatchInterval)

        const storedGame = createStoredGame()
        gStoredGames.push(storedGame)
        localStorage.setItem(gGame.level, JSON.stringify(gStoredGames))

        blowMines()
        revealMines()
        updateGameEmoji(VICTORY)
        showGameOverModal()
    }

}

function addMines(pos) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randPossibleMinePos = getRandPossibleMinePos(gBoard)

        gBoard[randPossibleMinePos.i][randPossibleMinePos.j].isMine = true
    }

}

function createStoredGame() {
    console.log('gGame.secsPassed', gGame.secsPassed)
    return {
        fName: gSession.fName,
        lName: gSession.lName,
        secsPassed: gGame.secsPassed,
    }
}

function onLevelSelect(level, levelStr) {
    if (isSessionOff()) return

    hideGameOverModal()
    gLevel = {
        SIZE: level.size,
        MINES: level.mines
    }

    gStoredGames.push(gSession)

    gGame.level = levelStr
    clearInterval(gStopWatchInterval)
    onInit()
}

function onRestart() {
    localStorage.setItem(gSession.level, JSON.stringify(gStoredGames))
    clearInterval(gStopWatchInterval)

    onInit()
}

function updateTimePassed() {
    const currTime = Date.now()
    const delta = currTime - gStartTime
    const secs = Math.floor(delta / 1000)
    const milliSecs = (delta % 1000) / 1000

    gGame.secsPassed = roundTo(secs + milliSecs, 1)
}

function handleSubmit(ev) {
    ev.preventDefault()

    const elSessionForm = document.querySelector('.session-form')
    const fNameInput = elSessionForm.querySelector('#fname').value
    const lNameInput = elSessionForm.querySelector('#lname').value

    gSession.fName = fNameInput
    gSession.lName = lNameInput

    hideSessionForm()
}
