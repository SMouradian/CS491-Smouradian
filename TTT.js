// Samuel Mouradian - CS 491.691.2001
// NOTE - YOU NEED A "gameState.json" FILE FOR THIS TO WORK


/**
 * @type {number}
 * @type {number}
 * @type {number}
 * @type {FileSystemgameFileFlag}
 * @type {string}
 */
let syncToJSON;
let loadToFile;
let importFromFile;
let gameFileFlag, gameFileInfo;

/*
==============================================================================
=============================== GAME STATE ===================================
==============================================================================
*/
/**
 * @param {HTMLElement} cells
 * @param {HTMLElement} gameButton
 * @param {HTMLElement} playerTurn
 * @param {number[][]} victoryCombination
 * @param {string} currPlayer
 * @param {boolean} currGame
*/

const cells = document.querySelectorAll(".cell");
const playerTurnText = document.querySelector("#playerTurn");
const gameButton = document.querySelector("#gameButton");
const DiceRollGuess = document.querySelector("#numberGuess");

/*
    Winning conditions
*/
const victoryCombinations = [
    [0,1,2], [3,4,5], [6,7,8], [0,3,6],
    [1,4,7], [2,5,8], [0,4,8], [2,4,6]
];

/**
 * @type {object}
 * @type {object}
*/
let newGame = {
    TTTBoard: ["", "", "", "", "", "", "", "", "" ],
    currPlayer: "",
    p1DiceGuess: null,
    p2DiceGuess: null,
    diceRoll: null,
    assignP1: [false, ""],
    assignP2: [false, ""],
    victoryCombination: null,
    winner: null
}

let presentGame = {
    TTTBoard: ["", "", "", "", "", "", "", "", "" ],
    currPlayer: "", 
    p1DiceGuess: null,
    p2DiceGuess: null,
    diceRoll: null,
    assignP1: [false, ""],
    assignP2: [false, ""],
    victoryCombination: null,
    winner: null
}


/**
 * @type {boolean}
 * @type {boolean}
 * @type {boolean}
 * @type {boolean}
 * @type {boolean}
 * @type {boolean}
 */
let gameFlag = false;
let startOfNewGame = true;
let P1 = false;
let P2 = false;
let twoNumberGuesses = false;
let moveFromPlayers = false;


diceValueFromAutoRoll.addEventListener("keydown", async (event) => {
    if(event.key === "Enter"){
        await rollStartingDice();
    }
});

function displayPlayers(){
    if((presentGame.p1DiceGuess !== null && presentGame.p2DiceGuess !== null) && !gameFlag){
        gameFlag = true;
        boardCreation();
    }
    if((presentGame.assignP1[1] === presentGame.currPlayer) && P1){
        playerTurnText.textContent = `Player One you are ${presentGame.assignP1[1]} your move!`;
    }
    else if((presentGame.assignP2[1] === presentGame.currPlayer) && P2){
        playerTurnText.textContent = `Player Two you are ${presentGame.assignP2[1]} your move!`;
    }
    else{
        playerTurnText.textContent = `waiting for other player's turn.`;
    }
}

/**
 * @returns {number}
 */
async function playerInputFromDice(){
    const numberGuess = document.getElementById("numberGuess").value;
    return parseInt(numberGuess);
}

function updatePlayerTurnText(){
    syncToJSON = setInterval(() => {
        displayPlayers();
    }, 250);
}

function removeDiceGuessInput(){
    if(twoSubmittedGuesses){
        document.getElementById("gameDice").style.display = "none";
    }
}

async function initiateGame(){
    await gameStateUpdate();
    if(!gameFlag){
        gameFlag = true;
        boardCreation();
    }
    playerTurnText.textContent = `Please enter your guess!`;
    if(P1){
        playerTurnText.textContent = `You are player 1 - Please enter your guess!`;
    }
    else if(P2){
        playerTurnText.textContent = `You are player 2 - Please enter your guess!`;
    }

    if(presentGame.assignP1[1] !== "" && presentGame.assignP2[1] !== ""){
        createGameStateAfterStart();
        presentGame.winner = null;
        await updateGameFileState();
    }
    else{
        document.getElementById("gameDice").style.display = "block";
    }
}

function formulateCells(){
    cells.forEach(cell => cell.removeEventListener("click", selectedCells));
    cells.forEach(cell => cell.addEventListener("click", selectedCells)); 
    cells.forEach(color => color.style.color = "white");
}


/**
 * @param {MouseEvent} event
 */
async function selectedCells(event){
    const cIndex = event.target.getAttribute("cIndex");
    if(presentGame.board[cIndex] != "" || !gameFlag){
        return;
    }
    await updatingChosenCells(event.target, cIndex);
    await updateGameFileState();
    await confirmVictory();
}

/**
 * @param {number} index
 * @param {html} cell
 */
async function updatingChosenCells(selectedCells, index){
    presentGame.board[index] = presentGame.currPlayer;
    cells[index].textContent = presentGame.currPlayer;
}


function updateBoardUsingGameState(){
    for(let i = 0; i < cells.length; i++){
        cells[i].textContent = presentGame.board[i];
    }
    if(presentGame.victoryCombination !== null){
        cangeTokenColors(presentGame.victoryCombination);
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile); 
        playerTurnText.textContent = `${presentGame.currPlayer} wins!`;
        gameFlag = false;
    }
    else if(!presentGame.board.includes("")){
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile); 
        playerTurnText.textContent = `Draw!`;
        gameFlag = false;
    }
}

function displayMessage(){
    if(startOfNewGame){
        document.querySelector(".tooltiptext").style.visibility = "visible";
        playerTurnText.textContent = `Please press start to play!`;
    }
}

function displayWinningPlayer(){
    playerTurnText.textContent = `${presentGame.currPlayer} won the last game!`;
    document.querySelector(".tooltiptext").style.visibility = "hidden";
    if(syncToJSON){
        clearInterval(syncToJSON);
    }
}

/**
 * @param {number[]} condition
 */
function cangeTokenColors(condition){
    cells[condition[0]].style.color = "red";
    cells[condition[1]].style.color = "red";
    cells[condition[2]].style.color = "red";
}

function boardCreation(){
    if(gameFlag){
        document.getElementById("gameBoard").style.visibility = "visible";
    }
    else{
        document.getElementById("gameBoard").style.visibility = "hidden";
    }
}

function restartWebPage(){
    cells.forEach(cell => cell.textContent = "");
    setButtonToStart();
    if(presentGame.winner === null){
        presentGame.winner = "O";
        playerTurnText.textContent = `No winner!`;
    }
}

function setButtonToClear(){
    gameButton.textContent = "CLEAR";
}

function setButtonToStart(){
    gameButton.textContent = "START";
}



/*
==============================================================================
=============================== GAME LOGIC ===================================
==============================================================================
*/
async function gameToggleButton(){
    if(!gameFlag && startOfNewGame && presentGame.winner === null){
        await initializeGame();
        setButtonToClear();
        gameButton.removeEventListener("click", gameToggleButton);
    } 
    else if(gameButton.textContent === "START"){
        await rematchGameInitialization();
        setButtonToClear();
    } 
    else{
        await restartGame();
        setButtonToStart();
    }
}

async function initializeGame(){
    await createNewGameState();
    await gameStateUpdate();
    await recreateGameState();
    await assignPlayersGameTokens();
    await initiateGame();
}

async function rematchGameInitialization(){
    setButtonToClear();
    await gameStateUpdate(); 
    await initiateGame(); 
    await prepareGame();
    updatePlayerTurnText();
}

/**
 * @returns {void}
 */
async function recreateGameState(){
    await gameStateUpdate();
    if(startOfNewGame && (presentGame.assignP1[0] === false && presentGame.assignP2[0] === false)){
        await setGameStateToFile();
        await gameStateUpdate();
        return;
    }
    if(startOfNewGame && (presentGame.assignP1[0] && presentGame.assignP2[0])){
        await setGameStateToFile(); 
        await gameStateUpdate(); 
        return;
    }
}

async function rollStartingDice(){
    await gameStateUpdate();
    const guess = await playerInputFromDice();
    if(isNaN(guess) || guess < 1 || guess > 6){
        return;
    }

    if(P1 === true){
        presentGame.p1DiceGuess = guess;
        await updateGameFileState();
    }else if(P2 === true){
        presentGame.p2DiceGuess = guess;
        await updateGameFileState();
    }

    if(presentGame.p1DiceGuess === null || presentGame.p2DiceGuess === null){
        return;
    }
    twoSubmittedGuesses = true;

    if(presentGame.diceRoll === null){
        presentGame.diceRoll = Math.floor(Math.random() * 6) + 1;
    }

    const player1Diff = Math.abs(presentGame.diceRoll - presentGame.p1DiceGuess);
    const player2Diff = Math.abs(presentGame.diceRoll - presentGame.p2DiceGuess);

    if(twoSubmittedGuesses && (player1Diff < player2Diff)){
        presentGame.currPlayer = "O";
        presentGame.assignP1[1] = "O";
        presentGame.assignP2[1] = "X";
    }
    else if(player1Diff === player2Diff){
        presentGame.diceRoll = "null";
        await updateGameFileState();
        return;

    }
    else{
        presentGame.currPlayer = "O";
        presentGame.assignP2[1] = "O";
        presentGame.assignP1[1] = "X";

    }

    if(twoSubmittedGuesses){       
        clearInterval(syncToJSON);
    }

    await updateGameFileState();
    await gameStateUpdate(); 
    if(twoSubmittedGuesses){
        updatePlayerTurnText();
    }

    removeDiceGuessInput();
    if(twoSubmittedGuesses){
        prepareGame();
        gameButton.addEventListener("click", gameToggleButton);
    }
}


/**
 * @param {boolean} isComputer 
 * @param {number[]} tempOptions
 * @returns {number|boolean}
 * @sideEffects
 */

async function checkForVictory(thisOptions){
    let rVal = 0;
    for(let i = 0; i < victoryCombinations.length; i++){
        const condition = victoryCombinations[i];
        const c1 = thisOptions[condition[0]];
        const c2 = thisOptions[condition[1]];
        const c3 = thisOptions[condition[2]];
        if(c1 == c2 && c2 == c3 ){
            cangeTokenColors(condition);
            presentGame.victoryCombination = condition;
            presentGame.winner = presentGame.currPlayer;
            rVal = 1;
        } 
    }
    return rVal;
}

async function confirmVictory(){
    let gameWon = false;
    gameWon = await checkForVictory(presentGame.board);

    if(gameWon){
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile);
        gameFlag = false;
        if(P1 && (presentGame.winner !== "O")){
            presentGame.assignP1[1] = "O";
            presentGame.assignP2[1] = "X";
            presentGame.winner = "O";
        }
        else if(P2 && (presentGame.winner !== "O")){
            presentGame.assignP2[1] = "O";
            presentGame.assignP1[1] = "X";
            presentGame.winner = "O";
        }

        await updateGameFileState();
    }
    else if(!presentGame.board.includes("")){
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile);
        gameFlag = false;
        await updateGameFileState();

    }
    else if((P1 && presentGame.assignP1[1] === presentGame.currPlayer) || (P2 && presentGame.assignP2[1] === presentGame.currPlayer)){
        await changeCurrentPlayer();
    }
}


/**
 * @sideEffects
 */
async function changeCurrentPlayer(){
    successfulMoveByPlayer = false;
    if(presentGame.currPlayer === "O"){
        presentGame.currPlayer = "X";
    }
    else{
        presentGame.currPlayer = "O";
    }
  
    clearInterval(importFromFile); 
    clearInterval(loadToFile);
    await updateGameFileState();
    successfulMoveByPlayer = false; 
    await prepareGame();
}

async function prepareGame(){
    if(!successfulMoveByPlayer && ((P1 && presentGame.assignP1[1] === presentGame.currPlayer) || (P2 && presentGame.assignP2[1] === presentGame.currPlayer))){
        clearInterval(importFromFile);
        clearInterval(loadToFile);
        await gameStateUpdate();
        updateBoardUsingGameState();
        loadToFile = setInterval(async () => {
            await updateGameFileState();
        }, 1000);
        successfulMoveByPlayer = true;
    }
    else if(successfulMoveByPlayer === false){
        clearInterval(importFromFile);
        clearInterval(loadToFile);
        importFromFile = setInterval(async () => {
            await gameStateUpdate();
            updateBoardUsingGameState();
        }, 250);
    }
    formulateCells();
}

async function restartGame(){
    gameFlag = false;
    clearInterval(syncToJSON);
    clearInterval(loadToFile);
    clearInterval(importFromFile);
    displayWinningPlayer();
    restartWebPage();
    createGameStateAfterStart();
    await updateGameFileState(); 
}

function createGameStateAfterStart(){
        presentGame.board = ["", "", "", "", "", "", "", "", "" ];
        if(presentGame.winner !== null){
            presentGame.currPlayer = presentGame.winner;
        }
        presentGame.victoryCombination = null;
        presentGame.p1DiceGuess = null;
        presentGame.p2DiceGuess = null;
        presentGame.diceRoll = null;
}


/**
 * @param {number} ms
 * @returns {Promise} 
 */
function sleep(ms){
    return new Promise(resolve =>setTimeout(resolve, ms));
}


/**
 * @returns {void}
 */
async function createNewGameState(){
    const playerOption = {
        types: [{       
            description: 'JSON Files',
            accept : {'application/json': ['.json']}
        }],
        excludeAcceptAllOption: true,
    };
    [gameFileFlag] = await window.showOpenFilePicker(playerOption);
    const errorFlag = await errorCatcher(gameFileFlag);
    if(errorFlag !== false){
        let fileData = await gameFileFlag.getFile();
    }
    else{
        return;
    }
}

/**
 * @returns  {void}
 */
async function assignPlayersGameTokens(){
    if(startOfNewGame){
        await gameStateUpdate();
        if(!presentGame.assignP1[0]){
            presentGame.assignP1[0] = true;
            P1 = true; 
            await updateGameFileState(); 

        }
        else if(!presentGame.assignP2[0]){
            presentGame.assignP2[0] = true;
            P2 = true; 
            await updateGameFileState(); 

        }
        else{
            window.location.reload();
            return;
        }
        startOfNewGame = false; 
        await sleep(500); 
        await updateGameFileState(); 
    }
}

async function setGameStateToFile(){
    const gameFile = await gameFileFlag.createWritable();    
    content = JSON.stringify(emptyGameState);
    await gameFile.write(content);
    await gameFile.close();
}

async function gameStateUpdate(){
    const currFileForGame = await gameFileFlag.getFile();
    content = await currFileForGame.text();
    presentGame = JSON.parse(content);
}


/**
 * @returns {void}
 */

async function updateGameFileState(){
    const accessibility = await gameFileFlag.requestaccessibility({ mode: 'readwrite' });
    if(accessibility !== 'granted'){
        return;
    }
    const currFileForGame = await gameFileFlag.createWritable();
    console.log("Current board before write:", presentGame.board);
    content = JSON.stringify(presentGame);
    await currFileForGame.write(content);
    await currFileForGame.close();
}


/**
 * @param {FileSystemgameFileFlag}
 * @returns {File}
 */

async function errorCatcher(gameFileFlag){
    if(!gameFileFlag){
        let leave = (event) => {
            if (event.keyCode === 27) {
                return;
            }
        };
        document.addEventListener("keydown", leave);
        createNewGameState();
        return false;
    }
    const fileData = await gameFileFlag.getFile();
    if(fileData.name !== "gameState.json"){
        let leave = (event) => {
            if (event.keyCode === 27) {
                return;
            }
        };
        document.addEventListener("keydown", leave);
        createNewGameState();
        return false;
    }

    return fileData;
}