'use strict'

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    // strHTML += `<tr><td class = "game-emoji" colspan="${mat[0].length}">${FACE}</td></tr>`
    strHTML += `<button class = "game-emoji" onclick = "onRestart()">🙂</button>`
    strHTML += `<span class="stop-watch">0.0</span>`

    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            // const cell = getCellHTML(mat[i][j])
            const cell = 0
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" 
                        onClick = "onCellClicked(${i}, ${j}, this)"
                        oncontextmenu="onCellMarked(${i}, ${j}, this)">
                            <span class="content">${cell}</span>
                            <span class="mark"></span>
                        </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    strHTML += `<button class = "level-btn" onClick ="onLevelSelect(BEGINNER,'Beginner')">Beginner</button>`
    strHTML += `<button class = "level-btn" onClick ="onLevelSelect(MEDIUM, 'Medium')">Medium</button>`
    strHTML += `<button class = "level-btn" onClick ="onLevelSelect(EXPERT, 'Expert')">Expert</button>`

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderUpdatedBoard(mat) {
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat[0].length; j++) {

            const cellHTML = getCellHTML(mat[i][j])
            const className = `.cell.cell-${i}-${j}`
            const elCellContent = document.querySelector(className + ' .content')
            elCellContent.innerText = cellHTML
            elCellContent.style.color = COLORS[mat[i][j].minesAroundCount]

        }
    }
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

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function clearIntervals() {
    for (var interval in gIntervals) {
        clearInterval(gIntervals[interval])
    }
}

function clearTimeouts() {
    for (var timeout in gTimeouts) {
        clearTimeout(gTimeouts[timeout])
    }
}

function getCellHTML(cell) {
    const cellHTML = cell.isMine ? MINE : cell.minesAroundCount
    return cellHTML
}

function neighborsLoop(board, row, col, func) {
    const cell = board[row][col]

    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === row && j === col) continue

            func(cell, board[i][j])
        }
    }
}



function getPossibleMinePos(board) {
    var possibleMinePos = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (!gBoard[i][j].isMine &&
                !(gBoard[i][j].minesAroundCount === 0) &&
                !gBoard[i][j].isRevealed &&
                !isCountZeroNegs(board, i, j)) possibleMinePos.push({ i, j })
        }
    }

    return possibleMinePos
}

function getRandPossibleMinePos(board) {
    const possibleMinePos = getPossibleMinePos(board)
    const randIdx = getRandomInt(0, possibleMinePos.length)

    return possibleMinePos[randIdx]
}

function isCountZeroNegs(board, row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === row && j === col) continue

            if (board[i][j].minesAroundCount === 0) return true
        }
    }

    return false
}

function updateGameEmoji(status) {
    const elGameEmoji = document.querySelector('.game-emoji')
    elGameEmoji.innerText = status
}

function roundTo(num, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}

function isSessionOff() {
    return (gSession.fName === null || gSession.lName === null)
}

function bubbleSort(games) {
    var sortedGames = games.slice()
    var swapCount

    while (swapCount !== 0) {
        swapCount = 0

        for (var i = 0; i < sortedGames.length - 1; i++) {
            var currGame = sortedGames[i]
            var nextGame = sortedGames[i + 1]

            if (currGame.secsPassed > nextGame.secsPassed) {
                swapCount += 1
                sortedGames.splice(i, 1, nextGame)
                sortedGames.splice(i + 1, 1, currGame)
            }
        }

    }
    return sortedGames
}