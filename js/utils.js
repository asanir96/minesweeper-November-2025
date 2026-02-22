'use strict'

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = getCellHTML(mat[i][j])
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
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

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
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
            if (gBoard[i][j] !== WALL &&
                gBoard[i][j] !== PACMAN &&
                gBoard[i][j] !== GHOST
            ) emptyPos.push({ i, j })
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

function getRandomEmptyPos() {
    const emptyPos = getEmptyPos()

    const randI = getRandomIntInclusive(0, emptyPos.length - 1)
    const randEmptyPos = emptyPos[randI]

    return randEmptyPos
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
