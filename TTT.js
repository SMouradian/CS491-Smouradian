// Samuel Mouradian             - CS 491.691.2001
// Assignment Due Date (NEW)    - 07.10.2025
// NOTE                         - Updated on 07.08.2025 for grading purposes


/*
==============================================================================
=============================== GAME STATE ===================================
==============================================================================
*/
/**
 * @param {HTMLElement} toggleBtn
 * @param {HTMLElement} playerDiceGuess
 * @param {html} cells
 * @param {html} toggleBtn
 * @param {html} playerTurn
 * @param {string} currPlayer
 * @param {boolean} currGame
 * @param {number[][]} victoryCombination
 */

const cells = document.querySelectorAll(".cell");
const playerTurn = document.querySelector("#playerTurn");
const toggleBtn = document.querySelector("#toggleBtn");
const playerDiceGuess = document.querySelector("#userInputField");

/**
 * @type {Object} defaultGameState
 */
let defaultGameState = {
    board: ["", "", "", "", "", "", "", "", ""],
    currPlayer: "",
    p1Guess: null,
    p2Guess: null,
    diceRoll: null,
    isP1: [false, ""],
    isP2: [false, ""],
    victorious: null,
    winner: null
}

/**
 * @type {Object} presentGameState
 */
let presentGameState = {
    board: ["", "", "", "", "", "", "", "", ""],
    currPlayer: "",
    p1Guess: null,
    p2Guess: null,
    diceRoll: null,
    isP1: [false, ""],
    isP2: [false, ""],
    victorious: null,
    winner: null
}

const victoryCombination = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

/**
 * @type {boolean} gameOne
 * @type {boolean} gameStarted
 * @type {boolean} player1
 * @type {boolean} player2
 * @type {boolean} playerSubmissions
 * @type {boolean} successfulPlayerAction
 * 
 * @type {number} refreshInterval
 * @type {number} fileLoadInterval
 * @type {number} importDataInterval
 * 
 * @type {FileSystemFileHandle} fileFlag
 * 
 * @type {string} gameInformation
 */
let gameOne = true;
let gameStarted = false;
let player1 = false;
let player2 = false;
let playerSubmissions = false;
let successfulPlayerAction = false;

let refreshInterval;
let fileLoadInterval;
let importDataInterval;

let fileFlag;
let gameInformation;


displayOpeningMessage();
toggleBtn.addEventListener("click", buttonToggle);
numberGuess.addEventListener("keydown", async(event) => {
    if(event.key === "Enter"){
        await selectStartingPlayer();
    }
});

function showPlayerData(){
    if((presentGameState.p1Guess !== null && presentGameState.p2Guess !== null) && !gameStarted){
        gameStarted = true;
        revealBoard();
    }

    if((presentGameState.isP1[1] === presentGameState.currPlayer) && player1){
        playerTurn.textContent = 'Player One, begin your move...';
    }
    else if((presentGameState.isP2[1] === presentGameState.currPlayer) && player2){
        playerTurn.textContent = 'Player Two, begin your move...';
    }
    else{
        playerTurn.textContent = 'Awaiting oponent...';
    }
}


/**
 * @returns {number} playerFlag
 */
async function getPlayerDiceInput(){
    const numberGuess = document.getElementById("numberGuess").value;
    return parseInt(numberGuess);
}

function awaitingOtherPlayerNumberSubmission(){
    playerTurn.textContent = 'Waiting for number guesses from each player...';
}

function updatePlayerTurn(){
    refreshInterval = setInterval(() => {
        showPlayerData();
    }, 250);
}

function removeInputField(){
    if(playerSubmissions){
        document.getElementById("gameDice").style.display = "none";
    }
}

async function initiateGUI(){
    await updateGameFile();
    if(!gameStarted){
        gameStarted = true;
        revealBoard();
    }

    playerTurn.textContent = 'Please enter a number.';
    if(player1){
        playerTurn.textContent = 'You are Player One - enter a number.';
    }
    else if(player2){
        playerTurn.textContent = 'You are Player Two - enter a number.';
    }

    if(presentGameState.isP1[1] !== "" && presentGameState.isP2[1] !== ""){
        createGameStateAfterStart();
        presentGameState.winner = null;
        await updateBackUpGameFile();
    }
    else{
        document.getElementById("gameDice").style.display = "block";
    }
}

function initializeCells(){
    cells.forEach(cell => cell.removeEventListener("click", cellClicked));
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    cells.forEach(color => color.style.color = "black");
}


/**
 * @param {MouseEvent} event
 */
async function cellClicked(event){
    const cellIndex = event.target.getAttribute("cellIndex");
    if(presentGameState.board[cellIndex] != "" || !gameStarted){
        return;
    }
    await updateGameCells(event.target, cellIndex);
    await updateBackUpGameFile();
    await checkForVictory();
}


/**
 * @param {number} index
 * @param {html} cell
 */
async function updateGameCells(cellClicked, index){
    presentGameState.board[index] = presentGameState.currPlayer;
    cells[index].textContent = presentGameState.currPlayer;
}

function updateBoard(){
    for(let i = 0; i < cells.length; i++){
        cells[i].textContent = presentGameState.board[i];
    }
    if(presentGameState.victorious !== null){
        changeCellColors(presentGameState.victorious);
        clearInterval(refreshInterval);
        clearInterval(fileLoadInterval);
        clearInterval(importDataInterval);
        playerTurn.textContent = `${presentGameState.currPlayer} wins!`;
        gameStarted = false;
    }
    else if(!presentGameState.board.includes("")){
        clearInterval(refreshInterval);
        clearInterval(fileLoadInterval);
        clearInterval(importDataInterval);
        playerTurn.textContent = `Draw!`;
        gameStarted = false;
    }
}

function drawText(){
    playerTurn.textContent = `Draw!`;
}

function victoryText(){
    playerTurn.textContent = `${presentGameState.currPlayer} wins!`;
}


function displayOpeningMessage(){
    if(gameOne){
        document.querySelector(".tooltiptext").style.visibility = "visible";
        playerTurn.textContent = `PRESS START.`;
    }
}

function displayCurrentPlayer(){
    playerTurn.textContent = `${presentGameState.currPlayer} won the previous match...`;
    document.querySelector(".tooltiptext").style.visibility = "hidden";
    if(refreshInterval){
        clearInterval(refreshInterval);
    }
}


/**
 * @param {number[]} cond
 */
function changeCellColors(cond){
    cells[cond[0]].style.color = "red";
    cells[cond[1]].style.color = "red";
    cells[cond[2]].style.color = "red";
}

function revealBoard(){
    if(gameStarted){
        document.getElementById("gameBoard").style.visibility = "visible";
    }
    else{
        document.getElementById("gameBoard").style.visibility = "hidden";
    }
}

function resetGameStateAndBoard(){
    cells.forEach(cell => cell.textContent = "");
    START();
    if(presentGameState.winner === null){
        presentGameState.winner = "0";
        playerTurn.textContent = `No one wins...`;
    }
}

function START(){
    toggleBtn.textContent = "START";
}

function CLEAR(){
    toggleBtn.textContent = "CLEAR";
}


/*
==============================================================================
=============================== GAME LOGIC ===================================
==============================================================================
*/
async function buttonToggle(){
    if(!gameStarted && gameOne && presentGameState.winner === null){
        await creatingGame();
        CLEAR();
        toggleBtn.removeEventListener("click", buttonToggle);
    }
    else if(toggleBtn.textContent === "START"){
        await creatingReMatch();
        CLEAR();
    }
    else{
        await restartGame();
        START();
    }
}

async function creatingGame(){
    await gameStateFile();
    await updateGameFile();
    await reInitiateGame();
    await assignPlayersIdentification();
    await initiateGUI();
}

async function creatingReMatch(){
    CLEAR();
    await updateGameFile();
    await initiateGUI();
    await prepGameLogic();
    updatePlayerTurn();
}


/**
 * @returns {void}
 */
async function reInitiateGame(){
    await updateGameFile();
    if(gameOne && (presentGameState.isP1[0] === false && presentGameState.isP2[0] === false)){
        await sendGameStateToFile();
        await updateGameFile();
        return;
    }
}

async function selectStartingPlayer(){
    await updateGameFile();
    const guess = await getPlayerDiceInput();
    if(isNaN(guess) || guess < 1 || guess > 6){
        return;
    }
    
    if(player1 === true){
        presentGameState.p1Guess = guess;
        await updateBackUpGameFile();
    }
    else if(player2 === true){
        presentGameState.p2Guess = guess;
        await updateBackUpGameFile();
    }

    if(presentGameState.p1Guess === null || presentGameState.p2Guess === null){
        awaitingOtherPlayerNumberSubmission();
        return;
    }
    playerSubmissions = true;
    if(presentGameState.diceRoll === null){
        presentGameState.diceRoll = Math.floor(Math.random() * 6) + 1;
    }

    const d1 = Math.abs(presentGameState.diceRoll - presentGameState.p1Guess);
    const d2 = Math.abs(presentGameState.diceRoll - presentGameState.p2Guess);

    if(playerSubmissions && (d1 < d2)){
        presentGameState.currPlayer = "O";
        presentGameState.isP1[1] = "O";
        presentGameState.isP2[1] = "X";
    }
    else if(d1 === d2){
        presentGameState.diceRoll = "null";
        await updateBackUpGameFile();
        return;
    }
    else{
        presentGameState.currPlayer = "O";
        presentGameState.isP2[1] = "O";
        presentGameState.isP1[1] = "X";
    }

    if(playerSubmissions){
        clearInterval(refreshInterval);
    }
    await updateBackUpGameFile();
    await updateGameFile();

    if(playerSubmissions){
        updatePlayerTurn();
    }

    removeInputField();
    if(playerSubmissions){
        prepGameLogic();
        toggleBtn.addEventListener("click", buttonToggle);
    }
}

/**
 * @returns {number|boolean}
*/
async function threeInARow(choices){
    let rVal = 0;
    for(let i = 0; i < victoryCombination.length; i++){
        const condition = victoryCombination[i];
        const C1 = victoryCombination[condition[0]];
        const C2 = victoryCombination[condition[1]];
        const C3 = victoryCombination[condition[2]];

        if(C1 == C2 && C2 == C3){
            changeCellColors(condition);
            presentGameState.victorious = condition;
            presentGameState.winner = presentGameState.currPlayer;
            rVal = 1;
        }
    }
    return rVal;
}

async function checkForVictory(){
    let gameWon = false;
    gameWon = await threeInARow(presentGameState.board);
    if(gameWon){
        clearInterval(refreshInterval);
        clearInterval(fileLoadInterval);
        clearInterval(importDataInterval);
        victoryText();
        gameStarted = false;

        if(player1 && (presentGameState.winner !== "O")){
            presentGameState.isP1[1] = "O";
            presentGameState.isP2[1] = "X";
            presentGameState.winner = "O";
        }
        else if(player2 && (presentGameState.winner !== "O")){
            presentGameState.isP2[1] = "O";
            presentGameState.isP1[1] = "X";
            presentGameState.winner = "O";
        }
        await updateBackUpGameFile();
    }
    else if(!presentGameState.board.includes("")){
        clearInterval(refreshInterval);
        clearInterval(fileLoadInterval);
        clearInterval(importDataInterval);
        drawText();
        gameStarted = false;
        await updateBackUpGameFile();
    }
    else if((player1 && presentGameState.isP1[1] === presentGameState.currPlayer) || (player2 && presentGameState.isP2[1] === presentGameState.currPlayer)){
        await changeActivePlayer();
    }
}


/**
 * @sideEffects
 */
async function changeActivePlayer(){
    successfulPlayerAction = false;
    if(presentGameState.currPlayer === "O"){
        presentGameState.currPlayer = "X";
    }
    else{
        presentGameState.currPlayer = "O";
    }

    clearInterval(importDataInterval);
    clearInterval(fileLoadInterval);
    await updateBackUpGameFile();
    successfulPlayerAction = false;
    await prepGameLogic();
}

async function prepGameLogic(){
    if(!successfulPlayerAction && ((player1 && presentGameState.isP1[1] === presentGameState.currPlayer) || (player2 && presentGameState.isP2[1] === presentGameState.currPlayer))){
        clearInterval(importDataInterval);
        clearInterval(fileLoadInterval);
        await updateGameFile();
        updateBoard();
        successfulPlayerAction = true;
    }
    else if(successfulPlayerAction === false){
        clearInterval(importDataInterval);
        clearInterval(fileLoadInterval);

        importDataInterval = setInterval(async () => {
            await updateGameFile();
            updateBoard();
        }, 250);
    }
    initializeCells();
}

async function restartGame(){
    gameStarted = false;
    clearInterval(refreshInterval);
    clearInterval(fileLoadInterval);
    clearInterval(importDataInterval);
    presentGameState.isP1 = [false, ""];
    presentGameState.isP2 = [false, ""];
    displayCurrentPlayer();
    resetGameStateAndBoard();
    createGameStateAfterStart();
    await updateBackUpGameFile();
}

function createGameStateAfterStart(){
    presentGameState.board = ["", "", "", "", "", "", "", "", "" ];
    if(presentGameState.winner !== null){
        presentGameState.currPlayer = presentGameState.winner;
    }
    presentGameState.victorious = null;
    presentGameState.p1Guess = null;
    presentGameState.p2Guess = null;
    presentGameState.diceRoll = null;
}


/**
 * @param {number} ms
 * @returns {Promise}
 */
function sleep(ms){
    return new Promise(reolve => setTimeout(resolve, ms));
}


/**
 * @returns {void}
 */
async function gameStateFile(){
    const playerChoices = {
        types: [{
            description: 'JSON Files',
            accept : {'application/json': ['.json']}
        }],
        excludeAcceptAllOption: true,
    };

    [fileFlag] = await window.showOpenFilePicker(playerChoices);
    const errorFlag = await catchFileError(fileFlag);
    if(errorFlag !== false){
        let fileData = await fileFlag.getFile();
    }
    else{
        alert("No file selected.");
        return;
    }
}


/**
 * @returns {void}
 */
async function assignPlayersIdentification(){
    if(gameOne){
        await updateGameFile();
        if(!presentGameState.isP1[0]){
            presentGameState.isP1[0] = true;
            player1 = true;
            await updateBackUpGameFile();
        }
        else if(!presentGameState.isP2[0]){
            presentGameState.isP2[0] = true;
            player2 = true;
            await updateBackUpGameFile();
        }
        else{
            alert("Both players already assigned...");
            window.location.reload();
            return;
        }
        gameOne = false;
        await sleep(500);
        await updateBackUpGameFile();
    }
}

async function sendGameStateToFile(){
    const gameFile = await fileFlag.createWritable();
    gameInformation = JSON.stringify(defaultGameState);
    await gameFile.write(gameInformation);
    await gameFile.close();
}

async function updateGameFile(){
    const currFile = await fileFlag.getFile();
    gameInformation = await currFile.text();
    presentGameState = JSON.parse(gameInformation);
}


/**
 * @returns {void}
 */
async function updateBackUpGameFile(){
    const security = await fileFlag.requestPermission({mode: 'rewrite'});
    if(security !== 'granted'){
        alert("Write permission denied.");
        return;
    }
    const currFile = await fileFlag.createWritable();
    console.log("Current board before write:", presentGameState.board);
    gameInformation = JSON.stringify(presentGameState);
    await currFile.write(gameInformation);
    await currFile.close();
}


/**
 * @param {FileSystemHandle} fileFlag
 * @returns {File}
 */
async function catchFileError(fileFlag){
    if(!fileFlag){
        alert("NO FILE SELECTED.");
        let leave = (event) => {
            if(event.keyCode === 27){
                return;
            }
        };
        document.addEventListener("keydown", leave);
        gameStateFile();
        return false;
    }
    const fileData = await fileFlag.getFile();
    if(fileData.name !== "gameState.json"){
        alert("WRONG FILE.");
        let leave = (event) => {
            if(event.keyCode === 27){
                return;
            }
        };
        document.addEventListener("keydown", leave);
        gameStateFile();
        return false;
    }
    return fileData;
}