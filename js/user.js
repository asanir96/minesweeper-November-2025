'use strict'

function onCellClicked(i, j, elCell) {
    if (!isCellClickAllowed(i, j)) return

    if (isHintModeActive()) {
        onHintReveal(i, j)
        return
    }

    if (!isInitClicked()) {
        initClick(i, j, elCell)
        return
    }

    // if (gBoard[i][j].isRevealed || gBoard[i][j].isMarked) return

    if (gBoard[i][j].isMine) {
        mineClicked(i, j)
        return
    }

    if (gBoard[i][j].minesAroundCount === 0) {
        expandReveal(gBoard, elCell, i, j)

        checkGameOver()

        updateGameEmoji(HAPPY)
        gEmojiTimeout = setTimeout(resetGameEmoji, 1000);

        return
    }

    revealCell({ i, j })
    renderRevealedCell({ i, j })
    checkGameOver()
}

function onCellMarked(i, j, elCell) {
    if (!gGame.isOn || isSessionOff() || !isInitClicked() || gGame.isHintModeOn) return

    if (gBoard[i][j].isRevealed) return

    markCell(i, j)
    renderMarkedCell(elCell, i, j)

    checkGameOver()
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
    clearInterval(gStopWatchInterval)
    clearInterval(gGameOverModalTimeout)
    clearInterval(gHintHoverAnimationInterval)
    localStorage.setItem(gSession.level, JSON.stringify(gStoredGames))

    onInit()
}

function onHintLogoClick(elHintLogo, hintIdx) {
    if (!isHintLogoClickAllowed(hintIdx)) {
        flashDisabledHint(elHintLogo)
        return
    }

    if (gHints[hintIdx].isClicked) {
        clearHover()

        gHints[hintIdx].isClicked = false
        gGame.hintIdxClicked = null
        elHintLogo.classList.remove('clicked')

        return
    }

    gHints[hintIdx].isClicked = true
    gGame.hintIdxClicked = hintIdx

    elHintLogo.classList.add('clicked')
}

function onMouseHover(elCell, row, col) {
    clearHover()
    if (gBoard[row][col].isRevealed) return

    if (gGame.hintIdxClicked !== null) {
        hintHoverNegs(elCell, row, col)
        
        gHintHoverAnimationInterval = setInterval(() => {
            hintHoverNegs(elCell, row, col)
        }, 500, row, col, elCell)
    } else {
        elCell.classList.toggle('active')
    }
}

function onHintReveal(row, col) {
    if (gBoard[row][col].isRevealed) return

    gHints[gGame.hintIdxClicked].isUsed = true

    var elHintClicked = document.querySelector(`.hint.hint-${gGame.hintIdxClicked}`)
    elHintClicked.style.opacity = '0.5'

    gGame.hintIdxClicked = null
    gGame.isHintModeOn = true
    clearHover()

    var neighborsPos = getNeighborPos(gBoard, row, col)
    neighborsPos = toggleRenderHintRevealNegs(gBoard, neighborsPos)

    setTimeout(() => {
        toggleRenderHintRevealNegs(gBoard, neighborsPos)
        gGame.isHintModeOn = false
    }, 1500, gBoard, neighborsPos)

    gGame.hintCount--
}

