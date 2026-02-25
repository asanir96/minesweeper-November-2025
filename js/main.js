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
var currSessionId = localStorage.getItem('sessionId')
var newSessionId = currSessionId === null ? 1 : ++currSessionId
localStorage.setItem('sessionId', newSessionId)
console.log('newSessionId', newSessionId)
var gStopWatchInterval
var gSession = {
    fName: null,
    lName: null
}

var gStoredGames
var gScoreBoard
var gStartTime
var gBoard
var gGame
const BEGINNER = { size: 4, mines: 2 }
const MEDIUM = { size: 8, mines: 14 }
const EXPERT = { size: 12, mines: 32 }

var gLevel = {
    SIZE: BEGINNER.size,
    MINES: BEGINNER.mines
}

function onInit() {
    gGame = createGame()
    const storedSessionsStr = localStorage.getItem(gGame.level)
    console.log('onInit --> storedSessionsStr', storedSessionsStr)
    gStoredGames = storedSessionsStr === null ? [] : JSON.parse(storedSessionsStr)
    console.log('gStoredSessions', gStoredGames)
    renderScoreBoard(gStoredGames)
    // const sessions = JSON.parse(gStoredSessions)
    // console.log('sessions', sessions)
    // buildScoreBoard(sessions)
    // renderScoreBoard(scores)
    hideGameOverModal()

    showSessionForm()
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')

    gGame.isOn = true
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

function onCellClicked(i, j, elCell) {
    if (!gGame.isOn || isSessionOff()) return

    if (!isInitClicked()) {
        initClick(i, j, elCell)
        return
    }

    if (gBoard[i][j].isRevealed || gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine) {
        mineClicked(i, j)
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
    if (!gGame.isOn || isSessionOff() || !isInitClicked()) return

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

function mineClicked(i, j) {
    gSession.isWin = false
    gGame.isOn = false

    clearInterval(gStopWatchInterval)

    const elCellContent = document.querySelector(`.cell.cell-${i}-${j} .content`)
    elCellContent.innerText = EXPLOSION
    revealCell({ i, j })
    updateGameEmoji(DEAD)
    revealMines()
    showGameOverModal()
}

function createStoredGame() {
    console.log('gGame.secsPassed', gGame.secsPassed)
    return {
        fName: gSession.fName,
        lName: gSession.lName,
        secsPassed: gGame.secsPassed,
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isRevealed) {
                const elCellMark = document.querySelector(`.cell.cell-${i}-${j} .mark`)
                elCellMark.innerText = EMPTY
                revealCell({ i, j })
            }
        }
    }
}
function blowMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isRevealed) {
                const elCellContent = document.querySelector(`.cell.cell-${i}-${j} .content`)
                elCellContent.innerText = EXPLOSION
            }
        }
    }
}

function expandRevealNegs(board, i, j, elCell) {
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= board.length) continue

        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= board[row].length) continue
            if (i === row && j === col) continue

            // func(cell, board[i][j])
            expandReveal(board, elCell, row, col)
        }
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
    renderTimePassed()
}

function renderTimePassed() {
    const elStopWatch = document.querySelector('.stop-watch')

    elStopWatch.innerText = gGame.secsPassed % 1 === 0 ? gGame.secsPassed + '.0' : gGame.secsPassed
}


function startTimer() {
    gGame.timerOn = true
    gGame.startTime = new Date(Date.now())
    gInterval = setInterval(showTime, 1)
}

function showTime() {
    var currTime = new Date(Date.now())
    var delta = new Date(currTime - gGame.startTime)
    var minutes = delta.getMinutes()

    const elStopWatch = document.querySelector('.stop-watch span')

    if (delta.getSeconds() >= 60) {
        gStopperMinutes
    }
    elStopWatch.innerText = `${minutes * 60 + delta.getSeconds()}:${delta.getMilliseconds()}`
}

function initClick(i, j, elCell) {
    gBoard[i][j].minesAroundCount = 0
    addMines({ i, j })
    setMinesNegsCount(gBoard)
    expandReveal(gBoard, elCell, i, j)
    renderUpdatedBoard(gBoard)


    gStartTime = Date.now()
    gStopWatchInterval = setInterval(updateTimePassed, 1)
}


function showGameOverModal() {
    const elGameOverModal = document.querySelector('.game-over')
    const elGameOverMessage = elGameOverModal.querySelector('div')

    elGameOverMessage.innerHTML = gGame.isWin ? WIN_LOGO : LOSE_LOGO
    elGameOverModal.style.display = 'block'

}
function hideGameOverModal() {


    const elGameOverModal = document.querySelector('.game-over')
    elGameOverModal.style.display = 'none'
}

function showSessionForm() {
    if (!(gSession.fName === null || gSession.lName === null)) return

    const elBoardContainer = document.querySelector('.board-container')
    const elScoreBoard = document.querySelector('.score-board')

    elBoardContainer.style.opacity = '0.3'
    elScoreBoard.style.opacity = '0.3'

    const elSessionForm = document.querySelector('.session-form')
    elSessionForm.style.display = 'block'
    elSessionForm.style.opacity = '1'
}

function hideSessionForm() {
    const elBoardContainer = document.querySelector('.board-container')
    const elScoreBoard = document.querySelector('.score-board')

    elBoardContainer.style.opacity = '1.0'
    elScoreBoard.style.opacity = '1.0'

    const elSessionForm = document.querySelector('.session-form')
    elSessionForm.style.display = 'none'
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

function isSessionOff() {
    return (gSession.fName === null || gSession.lName === null)
}

function renderScoreBoard(storedSessions) {
    const elScoreBoard = document.querySelector('.score-board')

    var strHTML =
        `    <table>
        <tbody>
            <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Time</th>
            </tr>`

    for (var i = 0; i < storedSessions.length; i++) {
        var currSession = storedSessions[i]
        strHTML +=
            `<tr>
                <td>${currSession.fName}</td>
                <td>${currSession.lName}</td>
                <td>${currSession.secsPassed}</td>
            </tr>`

    }
    strHTML += '</tbody></table>'

    elScoreBoard.innerHTML = strHTML
}

function getGameLevel() {
    switch (gLevel.SIZE) {
        case BEGINNER.size:
            return 'Beginner'
        case MEDIUM.size:
            return 'Medium'
        case EXPERT.size:
            return 'Expert'
    }
}


function isInitClicked() {
return (gGame.revealedCount !== 0 || gGame.markedCount !== 0)
}