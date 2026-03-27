'use strict'
function isCellClickAllowed(i, j) {
    return (gGame.isOn &&
        !isSessionOff() &&
        !gGame.isHintModeOn &&
        !gBoard[i][j].isRevealed &&
        !gBoard[i][j].isMarked)
}

function markCell(i, j) {
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
    }
}

function revealCell(pos, isHint) {
    const cell = gBoard[pos.i][pos.j]
    
    cell.isRevealed = true
    if (!cell.isMine) {
        gGame.revealedCount++
    }
}

function mineClicked(i, j) {
    gSession.isWin = false
    gGame.isOn = false

    clearInterval(gStopWatchInterval)
    clearTimeout(gEmojiTimeout)

    revealCell({ i, j })
    renderRevealedCell({ i, j })

    revealMines()

    const elCellContent = document.querySelector(`.cell.cell-${i}-${j} .content`)
    elCellContent.innerText = EXPLOSION

    updateGameEmoji(DEAD)
    updateGameOverModal()
    gGameOverModalTimeout = setTimeout(showGameOverModal, 1500);
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isRevealed) {
                gBoard[i][j].isMark = false
                revealCell({ i, j })
            }
        }
    }
}

// function expandReveal(board, elCell, i, j) {
//     var isHint = false
//     var isShow = true

//     var expandRevealedPos = [{ i, j }]
//     expandRevealedPos = expandReveal(board, elCell, i, j, expandRevealedPos)

//     // for (var i = 0; i < expandRevealedPos.length; i++) {
//     //     var currPos = expandRevealedPos[i]
//     //     var currCell = board[currPos.i][currPos.j]

//     //     currCell.isRevealed = true
//     //     gGame.revealedCount++
//     // }

//     // console.log('expandReveal --> { i, j }', { i, j })
//     // revealCell({ i, j })
//     // renderRevealedCells(expandRevealedPos)
// }

function expandReveal(board, i, j) {
    if (isExpandRevealStop(board, i, j)) return

    revealCell({ i, j })

    renderRevealedCell({ i, j })

    expandRevealNegs(board, i, j)
    return
}

function expandRevealNegs(board, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= board.length) continue

        for (var col = j - 1; col <= j + 1; col++) {
            if (!isCellInExpandRevealNegs(board, col, row, i, j)) continue

            if (board[row][col].minesAroundCount === 0) {
                expandReveal(board, row, col)
            } else {
                revealCell({ i: row, j: col })

                renderRevealedCell({ i: row, j: col })
            }
        }
    }
}

function isExpandRevealStop(board, i, j) {
    return (i >= board.length || i < 0 ||
        j >= board[0].length || j < 0 ||
        board[i][j].isMine ||
        board[i][j].isRevealed ||
        board[i][j].isMarked)

}

function renderRevealedMine(cell, elCellContent, elCell, isHint) {
    if (!cell.isMine) {
        elCellContent.innerText = cell.minesAroundCount
        // elCellContent.style.opacity = '0.3'

    } else if (isHint) {
        elCellContent.innerText = ''
    }
}

function hintHideNeighbors(gBoard, neighborsPos) {

    const isHint = false

    for (var i = 0; i < neighborsPos.length; i++) {
        var currNegPos = neighborsPos[i]

        if (gBoard[currNegPos.i][currNegPos.j].isRevealed ||
            (gBoard[currNegPos.i][currNegPos.j].isMarked) ||
            gBoard[currNegPos.i][currNegPos.j].isMine) continue

        if (show) revealCell(currNegPos, isHint)
        else hideCell(currNegPos)
        // gBoard[neighborsPos[i].i][neighborsPos[i].j].isHintRevealed = show ? true : false

    }
}

function checkGameOver() {
    if (gGame.revealedCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        gGame.isWin = true
        gGame.isOn = false

        clearInterval(gStopWatchInterval)

        const storedGame = createStoredGame()
        gStoredGames.push(storedGame)
        localStorage.setItem(gGame.level, JSON.stringify(gStoredGames))

        revealMines()

        updateGameEmoji(VICTORY)

        updateGameOverModal()
        gGameOverModalTimeout = setTimeout(showGameOverModal, 1500)

    }

}

function isHintLogoClickAllowed(hintIdx) {
    return (isInitClicked() && (gGame.hintIdxClicked === null || gGame.hintIdxClicked === hintIdx) && !gGame.isHintModeOn && !gHints[hintIdx].isUsed)
}