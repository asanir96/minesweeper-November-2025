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
    strHTML += `<button class = "level-btn" onClick ="onLevelSelect(BEGINNER)">Beginner</button>`
    strHTML += `<button class = "level-btn" onClick ="onLevelSelect(MEDIUM)">Medium</button>`
    strHTML += `<button class = "level-btn" onClick ="onLevelSelect(EXPERT)">Expert</button>`

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

// pos is an object like this - { i: 2, j: 7 }
function renderCell(pos, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    elCell.innerHTML = value

    // if (value === GHOST) {
    //     var elGhostContainer = elCell.document.querySelector('ghost-container')
    //     elGhostContainer.style.backgroundColor = value.color
    // }
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getRandomEmptyPos() {
    const emptyPos = getEmptyPos()
    const randIdx = getRandomInt(0, emptyPos.length)

    return emptyPos[randIdx]
}

function getFoodCount() {
    var foodCount = 0

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j] === FOOD || gBoard[i][j] === SUPER_FOOD) foodCount++
        }
    }

    return foodCount
}

function getRandomColor() {
    const letters = '0123456789ABCDEF'
    var color = '#'

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function getGhostIdxByPos(pos, ghosts) {
    for (var i = 0; i < ghosts.length; i++)
        if (ghosts[i].pos.i === pos.i && ghosts[i].pos.j === pos.j) return i
}


function getEmptyPos() {
    var emptyPos = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine &&
                !gBoard[i][j].isRevealed) emptyPos.push({ i, j })
        }
    }
    return emptyPos
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

// function getRandomEmptyPos() {
//     const emptyPos = getEmptyPos()

//     const randI = getRandomIntInclusive(0, emptyPos.length - 1)
//     const randEmptyPos = emptyPos[randI]

//     return randEmptyPos
// }

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



function revealCell(pos) {
    const cell = gBoard[pos.i][pos.j]
    cell.isRevealed = true
    gGame.revealedCount++

    const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    const elCellSpan = elCell.querySelector(`.content`)
    if (!cell.isMine) elCellSpan.innerText = cell.minesAroundCount

    elCell.classList.toggle('revealed')
    elCellSpan.style.display = 'block'
}

function getRandomMinePos() {

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


function isCountZeroNegs(cell, neighborCell) {
    if (neighborCell.minesAroundCount === 0) cell.minesAroundCount++
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