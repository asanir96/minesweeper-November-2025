'use strict'

function onCellClicked(i, j, elCell) {
    console.log('onCellMarked --> gGame.markedCount', gGame.markedCount)
    console.log('onCellMarked --> gGame.revealedCount', gGame.revealedCount)
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
    console.log('onCellMarked --> gGame.markedCount', gGame.markedCount)
    console.log('onCellMarked --> gGame.revealedCount', gGame.revealedCount)
    if (!gGame.isOn || isSessionOff() || !isInitClicked()) return

    if (gBoard[i][j].isRevealed) return

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
    }

    const elMark = elCell.querySelector('.mark')

    if (gBoard[i][j].isMarked) elMark.innerText = MARK
    else elMark.innerText = EMPTY

    elMark.style.display = 'block'

    checkGameOver()
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

            expandReveal(board, elCell, row, col)
        }
    }
}

function initClick(i, j, elCell) {
    gBoard[i][j].minesAroundCount = 0
    addMines({ i, j })
    setMinesNegsCount(gBoard)
    expandReveal(gBoard, elCell, i, j)
    renderUpdatedBoard(gBoard)


    gStartTime = Date.now()
    gStopWatchInterval = setInterval(() => {
        updateTimePassed()
        renderTimePassed()
    }, 1)
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