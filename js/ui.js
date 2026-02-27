'use strict'

const sessionFormHTML =
    `<form class="session-form" onsubmit="handleSubmit(event)">
        <div><img src="img/logo4.png" alt=""></div>
        First name:
        <input type="text" id="fname" name="fname" required/><br>
        Last name:
        <input type="text" id="lname" name="lname" required/><br>
        <input type="submit" id="submit" value="Play!" />
    </form>`


function updateGameOverModal() {
    const gameOverLogo = gGame.isWin ? WIN_LOGO : LOSE_LOGO

    const gameOverHTML =
        `    <div class="game-over">
        <div>${gameOverLogo}</div>
        <button onclick="onRestart()">Play Again</button>
    </div>`
    
    const elModal = document.querySelector('.modal')
    elModal.innerHTML = gameOverHTML
}

function showGameOverModal() {
    const elBoardContainer = document.querySelector('.board-container')
    const elScoreBoard = document.querySelector('.score-board')

    elBoardContainer.style.opacity = '0.3'
    elScoreBoard.style.opacity = '0.3'


    const elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
}

function hideGameOverModal() {
    const elBoardContainer = document.querySelector('.board-container')
    const elScoreBoard = document.querySelector('.score-board')

    elBoardContainer.style.opacity = '1.0'
    elScoreBoard.style.opacity = '1.0'


    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}

function showSessionForm() {
    if (!(gSession.fName === null || gSession.lName === null)) return

    const elBoardContainer = document.querySelector('.board-container')
    const elScoreBoard = document.querySelector('.score-board')

    elBoardContainer.style.opacity = '0.3'
    elScoreBoard.style.opacity = '0.3'

    const elModal = document.querySelector('.modal')
    elModal.innerHTML = sessionFormHTML
    elModal.style.display = 'block'
}

function hideSessionForm() {
    const elBoardContainer = document.querySelector('.board-container')
    const elScoreBoard = document.querySelector('.score-board')

    elBoardContainer.style.opacity = '1.0'
    elScoreBoard.style.opacity = '1.0'

    const elSessionForm = document.querySelector('.modal')
    elSessionForm.style.display = 'none'
}

function renderScoreBoard(sortedGames, maxGameCount) {
    const elScoreBoard = document.querySelector('.score-board')

    var strHTML =
        `<table>
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Time</th>
                </tr>
            </thead>
        <tbody>`

    for (var i = 0; i < maxGameCount; i++) {
        var currSession = sortedGames[i]
        if (currSession) {
            strHTML +=
                `<tr>
                <td>${currSession.fName}</td>
                <td>${currSession.lName}</td>
                <td>${currSession.secsPassed}</td>
            </tr>`
        }
    }
    strHTML +=
        `</tbody>
    </table>`

    elScoreBoard.innerHTML = strHTML
}

function revealCell(pos) {
    const cell = gBoard[pos.i][pos.j]
    cell.isRevealed = true
    gGame.revealedCount++

    const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    const elCellContent = elCell.querySelector(`.content`)
    if (!cell.isMine) elCellContent.innerText = cell.minesAroundCount

    elCell.classList.toggle('revealed')
    elCellContent.style.display = 'block'
}

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

function updateGameEmoji(status) {

    const elGameEmoji = document.querySelector('.game-emoji')
    elGameEmoji.innerText = status
}
function resetGameEmoji() {
    
    const elGameEmoji = document.querySelector('.game-emoji')
    elGameEmoji.innerText = FACE
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

function renderTimePassed() {
    const elStopWatch = document.querySelector('.stop-watch')

    elStopWatch.innerText = gGame.secsPassed % 1 === 0 ? gGame.secsPassed + '.0' : gGame.secsPassed
}
function updateModal() {

}
function showModal() {

}