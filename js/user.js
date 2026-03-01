'use strict'

function onCellClicked(i, j, elCell) {
    if (!gGame.isOn || isSessionOff() || gGame.isHintRevealed) return

    if (gGame.hintIdxClicked !== null && isInitClicked()) {
        onHintReveal(i, j)
        return
    }

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
        updateGameEmoji(HAPPY)
        gEmojiTimeout = setTimeout(resetGameEmoji, 1000);
        console.log('gBoard[i][j].minesAroundCount condition--> gEmojiTimeout', gEmojiTimeout)
        expandReveal(gBoard, elCell, i, j)
        checkGameOver()
        return
    }


    revealCell({ i, j })
    checkGameOver()
}

function onCellMarked(i, j, elCell) {
    if (!gGame.isOn || isSessionOff() || !isInitClicked() || gGame.isHintRevealed) return

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
    updateCellColors(gBoard)

    updateGameEmoji(HAPPY)
    gEmojiTimeout = setTimeout(resetGameEmoji, 1000);

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

    console.log('gEmojiTimeout', gEmojiTimeout)
    clearInterval(gStopWatchInterval)
    clearTimeout(gEmojiTimeout)

    const elCellContent = document.querySelector(`.cell.cell-${i}-${j} .content`)
    elCellContent.innerText = EXPLOSION
    revealCell({ i, j })
    updateGameEmoji(DEAD)
    revealMines()
    updateGameOverModal()
    gGameOverModalTimeout = setTimeout(showGameOverModal, 1500);

}

function onLevelSelect(level, levelStr) {
    if (isSessionOff() || !gGame.isOn) return

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

function onHintLogoClick(elHintLogo, hintIdx) {
    console.log()
    if (gHints[hintIdx].isUsed){
        elHintLogo.style.opacity = '0.5'
        elHintLogo.style.color = 'red'
        setTimeout(() => {
            elHintLogo.style.color = 'rgb(255, 222, 164)'
        }, 100)
        return
    } else if (!isInitClicked() || gGame.hintIdxClicked !== null || gGame.isHintRevealed) {
        elHintLogo.style.color = 'red'
        setTimeout(() => {
            elHintLogo.style.color = 'black'
        }, 100)
        return
    }
    
    
    elHintLogo.style.color = 'rgb(255, 222, 164)'
    gHints[hintIdx].isClicked = true
    gGame.hintIdxClicked = hintIdx
}

function onMouseHover(elCell, row, col) {
    if (gGame.hintIdxClicked === null || gBoard[row][col].isRevealed) return

    
    clearHover()
    elCell.classList.toggle('hover')
    const cell = gBoard[row][col]

    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === row && j === col) continue
            var elNegCell = document.querySelector(`.cell.cell-${i}-${j}`)
            elNegCell.classList.toggle('hover')
        }
    }

}


function onHintReveal(row, col) {
    if (gBoard[row][col].isRevealed) return

    gHints[gGame.hintIdxClicked].isUsed = true

    var elHintClicked = document.querySelector(`.hint.hint-${gGame.hintIdxClicked}`)
    console.log(`.hint.hint-${gGame.hindIdxClicked}`)
    elHintClicked.style.opacity = '0.5'

    gGame.hintIdxClicked = null
    gGame.isHintRevealed = true
    clearHover()

    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === row && j === col) continue
            if (gBoard[i][j].isRevealed) continue
            if (gBoard[i][j].isMarked) continue
            if (gBoard[i][j].isMine) continue

            revealCell({ i, j }, gGame.isHintRevealed)
        }
    }

    gGame.isHintClicked = false
    gGame.hintCount--
    setTimeout(hintHide, 1500, { i: row, j: col })
}