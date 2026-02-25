'use strict'
var gIsMark = false
const gModal = { text: 'You were blessed at ', CurrTimeStr: '' }
var gTimeoutId
const ninjaImgSrc = "img/ninja.png"
const caImgSrc = 'img/ca.png'

function onInit() {
    const elH1 = document.querySelector('h1')
    setTimeout(() => {
        elH1.innerText = 'I Love JS'
    }, 3000)
}

function onMark(elBtn) {
    mark('.box span')
    if (!gIsMark) {
        // mark('.box span')
        elBtn.innerText = 'Unmark'
        gIsMark = true
    } else {
        mark('.box span')
        elBtn.innerText = 'Mark'
        gIsMark = false

    }
}

function onMouseEnter(elImg) {
    elImg.src = caImgSrc
}

function onMouseLeave(elImg) {
    elImg.src = ninjaImgSrc
}

function onChangeSubHeader(elSpan) {
    if (!gIsMark) return
    
    var elH2Span = document.querySelector('h2 span')
    elH2Span.innerText = elSpan.innerText
}

function onHandleKey(ev) {
    if (ev.key !== 'Escape')
        return
    var elBtn = document.querySelector('.modal button')
    onCloseModal(elBtn)
}

function openModal() {
    clearTimeout(gTimeoutId)
    const modal = document.querySelector('.modal')
    modal.style.display = 'block'
    gTimeoutId = setTimeout(onCloseModal, 5000)
}

function onCloseModal(elBtn) {
    if (elBtn) clearTimeout(gTimeoutId)

    const modal = document.querySelector('.modal')
    modal.style.display = 'none'
}

function onBless() {
    gModal.CurrTimeStr = getTime()

    const modal = document.querySelector('.modal')
    const elModalH2 = modal.querySelector('h2')
    elModalH2.style.color = getRandomColor()

    elModalH2.innerText = gModal.text + ' ' + gModal.CurrTimeStr
    console.log('openModal')
    openModal()
}

function onImgClicked() {
    onBless()
}
function getTime() {
    return new Date().toString().split(' ')[4]
}

function getRandomColor() {
    const letters = '0123456789ABCDEF'
    var color = '#'

    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function mark(selector) {
    var elMarkItems = document.querySelectorAll(selector)

    for (var i = 0; i < elMarkItems.length; i++) {
        elMarkItems[i].classList.toggle('mark')
    }
}