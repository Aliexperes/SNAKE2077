const playground = document.querySelector('.playground')
const gameScoreElem = document.querySelector('.score')
const highScoreElem = document.querySelector('.HighScore span')
const loader = document.querySelector('#loader')
const sfx = document.querySelector('#sfx')
const fixedHead = document.querySelector(".fixed-head")
const setDataToLocalStorage = (value) => {
    localStorage.setItem("SNAKE2077", JSON.stringify(value))
}
const getDataFromLocalStorage = () => {
    if (!(localStorage.getItem("SNAKE2077"))) {
        data = {
            "gameBlockSize": 12,
            "highScore": 0
        }
        setDataToLocalStorage(data)
    }
    return JSON.parse(localStorage.getItem("SNAKE2077"))
}
starterData = getDataFromLocalStorage()
let gameConfig = {
    score: 0,
    highScore: Number(starterData.highScore),
    gameBlockSize: Number(starterData.gameBlockSize),
    snakeBlockSize: 1,
    gameSpeed: 2,
    direction: "ArrowUp",
    isGameStarted: false,
    isSuspended: false,
    gameDifficulty: 2,
    gameInterval: null,
}
const playSfx = sfxName => {
    if (sfx.src) {
        sfx.pause()
    }
    sfx.src = `assets/sfx/${sfxName}.mp3`
    sfx.play()
}
let snakePos = {
    head: 0,
    body: [1],
    prevHeadPos: 0
}
const buildPlayGround = () => {
    blockSize = gameConfig.gameBlockSize
    playground.innerHTML = ''
    let blocksFragment = new DocumentFragment()
    let playgroundSize = getComputedStyle(playground).width.substr(0, getComputedStyle(playground).width.length - 2).split(".")[0] - 4
    gameConfig.snakeBlockSize = (playgroundSize / blockSize) + "px"
    for (let x = 1; x <= (blockSize * blockSize); x++) {
        let newBlock = document.createElement('div')
        newBlock.classList.add('block')
        newBlock.id = `block-${x}`
        newBlock.style.width = (playgroundSize / blockSize) + "px"
        newBlock.style.height = (playgroundSize / blockSize) + "px"
        blocksFragment.append(newBlock)
    }
    playground.append(blocksFragment)
}
const setDefaultPos = (blockSize) => {
    blockSize = gameConfig.gameBlockSize
    let snakeHead = document.createElement("div")
    let snakeBody = document.createElement("div")
    snakeHead.classList.add("snake-head")
    snakeBody.classList.add("snake-body")
    snakeBody.id = "body-1"
    let centerBlockNum = (((blockSize * blockSize) / 2) + (Math.random() * 6)).toFixed(0)
    let centerBlockElem = document.querySelector(`#block-${centerBlockNum}`)
    let bottomOfCenterBlockElem = document.querySelector(`#block-${(Number(centerBlockNum) + blockSize)}`)
    centerBlockElem.append(snakeHead)
    bottomOfCenterBlockElem.append(snakeBody)
    centerBlockElem.classList.add("hasChild")
    bottomOfCenterBlockElem.classList.add("hasChild")
    snakePos.head = centerBlockNum
}
const highlightLosingReason = (block) => {
    if (block) {
        block.style.animationName = "bgHighlighter"
        block.style.animationDuration = "1500ms"
        block.addEventListener("animationend", () => {
            block.style.animationName = ""
            block.style.animationDuration = ""
        })
    } else {
        playground.style.animationName = "borderHighlighter"
        playground.style.animationDuration = "1s"
        playground.addEventListener("animationend", () => {
            playground.style.animationName = ""
            playground.style.animationDuration = ""
        })
    }
}
const gameLose = (block) => {
    fixedHead.style.animationName = "showFixedHead"
    fixedHead.style.animationDuration = "1s"
    fixedHead.addEventListener("animationend", () => {
        fixedHead.style.animationName = ""
        fixedHead.style.animationDuration = ""
        fixedHead.style.top = "0"
    })
    loader.style.display="block"
    document.querySelectorAll(".rightSide button").forEach(elem=>{elem.style.visibility = 'visible'})
    playSfx('kl-peach-game-over-iii-142453')
    highlightLosingReason(block)
    gameConfig.isGameStarted = false
    gameConfig.isSuspended = true
    snakePos.body = [1]
    snakePos.head = 0
    setTimeout(()=>{
        loader.style.display="none"
        document.querySelector(".play i").style.visibility = 'visible'
        gameConfig.isSuspended = false
    },1000)
    setDataToLocalStorage({
        "gameBlockSize": gameConfig.gameBlockSize,
        "highScore": gameConfig.highScore
    })
    gameConfig.score = 0
    clearInterval(gameConfig.gameInterval)
}
const updateBodyPos = () => {
    let lastItem = snakePos.body[snakePos.body.length - 1]
    snakePos.body.unshift(lastItem)
    snakePos.body.pop()
}
const move = (score, nextBlock, snakeHead, currentBlock, tail, newHeadPos) => {
    nextBlock.innerHTML = ''
    nextBlock.classList.add("hasChild")
    if (score) {
        snakePos.body.push(snakePos.body.length + 1)
        gameConfig.score += score
        if (gameConfig.score > gameConfig.highScore) {
            gameConfig.highScore += score
        }
        gameScoreElem.innerHTML = gameConfig.score
        highScoreElem.innerHTML = gameConfig.highScore
        insertFood()
    }
    nextBlock.append(snakeHead)
    if (tail) {
        currentBlock.append(tail)
        tail.parentElement.classList.remove("hasChild")
    } else {
        currentBlock.insertAdjacentHTML('beforeend', `<div class="snake-body" id="body-${snakePos.body.length}"></div>`)
    }
    snakePos.prevHeadPos = snakePos.head
    snakePos.head = Number(snakePos.head) + newHeadPos
}
const updateFrame = (speed) => {
    gameConfig.gameInterval = setInterval(() => {
        if (gameConfig.isGameStarted) {
            let currentBlock = document.querySelector(`#block-${snakePos.head}`)
            let snakeHead = document.querySelector('.snake-head')
            updateBodyPos()
            let tail = document.querySelector(`#body-${snakePos.body[snakePos.body.length - 1]}`)
            switch (gameConfig.direction) {
                case "ArrowUp":
                    let topBlock = document.querySelector(`#block-${snakePos.head - gameConfig.gameBlockSize}`)
                    if (topBlock) {
                        if (topBlock.firstElementChild) {
                            if (topBlock.firstElementChild.className.includes("great-food")) {
                                move(3, topBlock, snakeHead, currentBlock, false, -gameConfig.gameBlockSize)
                                playSfx('decidemp3-14575')
                            } else if (topBlock.firstElementChild.className.includes("normal-food")) {
                                move(1, topBlock, snakeHead, currentBlock, false, -gameConfig.gameBlockSize)
                                playSfx("short-success-sound-glockenspiel-treasure-video-game-6346")
                            } else if (topBlock.firstElementChild.className.includes("snake-body")) {
                                gameLose(topBlock.firstElementChild)
                            }
                        } else {
                            move(0, topBlock, snakeHead, currentBlock, tail, -gameConfig.gameBlockSize)
                        }
                    } else {
                        gameLose()
                    }
                    break;
                case "ArrowLeft":
                    let leftBlock = document.querySelector(`#block-${snakePos.head - 1}`)

                    if (leftBlock) {
                        if (Number(leftBlock.id.slice(6)) % gameConfig.gameBlockSize === 0) {
                            gameLose()
                        } else {
                            if (leftBlock.firstElementChild) {
                                if (leftBlock.firstElementChild.className.includes("great-food")) {
                                    move(3, leftBlock, snakeHead, currentBlock, false, -1)
                                    playSfx('decidemp3-14575')

                                } else if (leftBlock.firstElementChild.className.includes("normal-food")) {
                                    move(1, leftBlock, snakeHead, currentBlock, false, -1)
                                    playSfx("short-success-sound-glockenspiel-treasure-video-game-6346")

                                } else if (leftBlock.firstElementChild.className.includes("snake-body")) {
                                    gameLose(leftBlock.firstElementChild)
                                }
                            } else {
                                move(0, leftBlock, snakeHead, currentBlock, tail, -1)
                            }
                        }
                    } else {
                        gameLose()
                    }
                    break;
                case "ArrowRight":
                    let rightBlock = document.querySelector(`#block-${snakePos.head + 1}`)

                    if (rightBlock) {
                        if (Number(rightBlock.id.slice(6)) % gameConfig.gameBlockSize === 1) {
                            gameLose()
                        } else {
                            if (rightBlock.firstElementChild) {
                                if (rightBlock.firstElementChild.className.includes("great-food")) {
                                    move(3, rightBlock, snakeHead, currentBlock, false, 1)
                                    playSfx('decidemp3-14575')

                                } else if (rightBlock.firstElementChild.className.includes("normal-food")) {
                                    move(1, rightBlock, snakeHead, currentBlock, false, 1)
                                    playSfx("short-success-sound-glockenspiel-treasure-video-game-6346")

                                } else if (rightBlock.firstElementChild.className.includes("snake-body")) {
                                    gameLose(rightBlock.firstElementChild)
                                }
                            } else {
                                move(0, rightBlock, snakeHead, currentBlock, tail, 1)

                            }
                        }
                    } else {
                        gameLose()
                    }
                    break;
                case "ArrowDown":
                    let downBlock = document.querySelector(`#block-${snakePos.head + gameConfig.gameBlockSize}`)

                    if (downBlock) {
                        if (downBlock.firstElementChild) {
                            if (downBlock.firstElementChild.className.includes("great-food")) {
                                move(3, downBlock, snakeHead, currentBlock, false, gameConfig.gameBlockSize)
                                playSfx('decidemp3-14575')

                            } else if (downBlock.firstElementChild.className.includes("normal-food")) {
                                move(1, downBlock, snakeHead, currentBlock, false, gameConfig.gameBlockSize)
                                playSfx("short-success-sound-glockenspiel-treasure-video-game-6346")

                            } else if (downBlock.firstElementChild.className.includes("snake-body")) {
                                gameLose(downBlock.firstElementChild)
                            }
                        } else {
                            move(0, downBlock, snakeHead, currentBlock, tail, gameConfig.gameBlockSize)

                        }
                    } else {
                        gameLose()
                    }
                    break;
            }
        }
    }, (1000 / speed))
}
const insertFood = () => {
    while (true) {
        let randomBlock = document.querySelector(`#block-${(Math.random() * (gameConfig.gameBlockSize ** 2)).toFixed(0)}:not(.hasChild)`)
        if (randomBlock) {
            randomBlock.insertAdjacentHTML('beforeend', `
                <div class="${(((Math.random() * gameConfig.gameDifficulty).toFixed(0)) == 2) ? "great" : "normal"}-food"></div>
            `)
            break;
        }
    }
}
document.body.addEventListener("keyup", event => {
    if (event.code.startsWith("Arrow")) {
        switch (event.code) {
            case "ArrowUp":
                let topBlock = document.querySelector(`#block-${snakePos.head - gameConfig.gameBlockSize}`)
                if (!(topBlock?.firstElementChild?.className.includes("snake-body") && topBlock.id === `block-${snakePos.prevHeadPos}`)) {
                    gameConfig.direction = event.code
                }
                break;
            case "ArrowLeft":
                let leftBlock = document.querySelector(`#block-${snakePos.head - 1}`)
                if (!(leftBlock?.firstElementChild?.className.includes("snake-body") && leftBlock.id === `block-${snakePos.prevHeadPos}`)) {
                    gameConfig.direction = event.code
                }
                break;
            case "ArrowRight":
                let rightBlock = document.querySelector(`#block-${snakePos.head + 1}`)
                if (!(rightBlock?.firstElementChild?.className.includes("snake-body") && rightBlock.id === `block-${snakePos.prevHeadPos}`)) {
                    gameConfig.direction = event.code
                }
                break;
            case "ArrowDown":
                let downBlock = document.querySelector(`#block-${snakePos.head + gameConfig.gameBlockSize}`)
                if (!(downBlock?.firstElementChild?.className.includes("snake-body") && downBlock.id === `block-${snakePos.prevHeadPos}`)) {
                    gameConfig.direction = event.code
                }
                break;
        }
    }
})
currentBlockSize = gameConfig.gameBlockSize
const makeGameReady = () => {
    if (currentBlockSize === gameConfig.gameBlockSize) {
        document.querySelectorAll("div[class^='snake'], div[class$='food']").forEach((elem) => {
            elem.remove()
        })
        setDefaultPos()
        insertFood()
    } else {
        buildPlayGround()
        setDefaultPos()
        insertFood()
        currentBlockSize = gameConfig.gameBlockSize
    }
    gameScoreElem.innerHTML = 0
}
const start = () => {
    gameConfig.direction = "ArrowUp"

    fixedHead.style.animationName = "hideFixedHead"
    fixedHead.style.animationDuration = "1s"
    fixedHead.addEventListener("animationend", () => {
        fixedHead.style.top="-300px"
        fixedHead.style.animationName = ""
        fixedHead.style.animationDuration = ""
    })

    gameConfig.isGameStarted = true
    playSfx("winfantasia-6912")
    document.querySelectorAll(".play i , .rightSide button").forEach(elem=>{elem.style.visibility = 'hidden'})
    updateFrame(gameConfig.gameSpeed)
}

const init = () => {
    loader.style.display="none"
    blockSize = gameConfig.gameBlockSize
    document.querySelector(`#size-${blockSize}`).classList.add("active")
    highScoreElem.innerHTML = gameConfig.highScore
    document.querySelectorAll("button").forEach(elem => {
        elem.addEventListener("click", e => {
            if (e.target.className.includes("difficulty")) {
                let lastActive = document.querySelector(".difficulty.active")
                lastActive.classList.remove("active")
                elem.classList.add('active')
                let buttonName = e.target.innerHTML
                if (buttonName === "EASY") {
                    gameConfig.gameDifficulty = 2
                    gameConfig.gameSpeed = 2
                } else if (buttonName === "MEDIUM") {
                    gameConfig.gameDifficulty = 4
                    gameConfig.gameSpeed = 4
                } else if (buttonName === "HARD") {
                    gameConfig.gameDifficulty = 6
                    gameConfig.gameSpeed = 6
                }
            }
            else if (e.target.className.includes("size")) {
                let lastActive = document.querySelector(".size.active")
                lastActive.classList.remove("active")
                elem.classList.add('active')
                let buttonName = e.target.innerHTML
                if (buttonName === "12X12") {
                    gameConfig.gameBlockSize = 12
                    makeGameReady()
                } else if (buttonName === "16X16") {
                    gameConfig.gameBlockSize = 16
                    makeGameReady()
                } else if (buttonName === "20X20") {
                    gameConfig.gameBlockSize = 20
                    makeGameReady()
                }
                setDataToLocalStorage({
                    "gameBlockSize": gameConfig.gameBlockSize,
                    "highScore": gameConfig.highScore
                })
            }
        })
    })
    isFirstLoad = true
    document.body.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            if (!gameConfig.isGameStarted && !gameConfig.isSuspended) {
                if(!isFirstLoad){
                    makeGameReady()
                }
                start()
                isFirstLoad = false
            }
        }
    })
    document.querySelector(".play i").addEventListener('click', () => {
        if (!gameConfig.isGameStarted && !gameConfig.isSuspended) {
            if(!isFirstLoad){
                makeGameReady()
            }
            start()
            isFirstLoad = false
        }
    })
}
init()
buildPlayGround()
makeGameReady()