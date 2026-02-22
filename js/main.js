'use strict'
const MINE = '💣'
const EMPTY = ''

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
}

function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    console.table(gBoard)
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

    board[1][1].isMine = true
    board[3][2].isMine = true

    setMinesNegsCount(board)
    return board
}

function createCell() {
    var cell = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false
    }

    return cell
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            neighborsLoop(board, i, j, updateNegs)
        }
    }
}

function updateNegs(cell, neighborCell) {
    if (neighborCell.isMine) cell.minesAroundCount++
}
