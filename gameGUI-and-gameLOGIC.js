// Samuel Mouradian - CS 491.691.2001


/*
    Global variables
*/
let syncToJSON;
let loadToFile;
let importFromFile;
let gameFileFlag, gameFileInfo;

/*
==============================================================================
=========================== GAME STATE & LOGIC ===============================
==============================================================================
*/
/**
 * @param {html} cells                      - Registers all the cells on the game board.
 * @param {html} gameButton                 - Settings button for game.
 * @param {html} playerTurn                 - Tells the player whose turn it is.
 * @param {number[][]} victoryCombination   - A 2D array of all the cells on the board, and their various combinations to secure a win.
 * @param {string} currPlayer               - Registers the current player, which will be X (you) or O (the bot).
 * @param {string[]} boardArray             - An array that contains the current state of the board.
 * @param {boolean} currGame                - A flag that registers whether or not a game is being played.
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

/*
    Creates a new game with an empty board. Players are not assigned yet,
    so all values are null, including the winner.
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

/*  
    Values for current game being played. This will be pushed into the json file
    and updated as the game goes on.
*/
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
 * This is a documentation of the following variables needed for the Tic Tac Toe Game State:
 * gameFlag             - This is used to determine whether or not a game is currently gameFlag.
 * startOfNewGame       - This is used to determine whether or not a fresh game has been started.
 * P1                   - This is used to highlight which player is taking their turn.
 * P2                   - Just like "P1," this is used to highlight which player is taking their turn.
 * twoNumberGuesses     - This is used to determine if both players have submitted a guess to start the game.
 * moveFromPlayers      - This is used to determine if a player has made a legal move on the game board.
 */
let gameFlag = false;
let startOfNewGame = true;
let P1 = false;
let P2 = false;
let twoNumberGuesses = false;
let moveFromPlayers = false;


/*
    The following function will be the game toggle. It will check and see whether or not a game
    has begun. If one has, it will change the "start" button to a "clear" button. Otherwise, it
    will prompt the players to begin a new game.
*/
async function gameToggle(){
    if(!gameFlag && startOfNewGame && presentGame.winner === null){
        await initializeNewGame();
        gameButton.textContent = "CLEAR";
        gameButton.removeEventListener("click", gameToggle);
    } 
    else if(gameButton.textContent === "START"){
        await resetGame();
        gameButton.textContent = "CLEAR";
    } 
    else{
        await restartGame();
        gameButton.textContent = "START";
    }
}

/*
    The following function will initialize a new game, and will create a file on the client-end
    that will be maintained and updated as the game progresses. If the game is reset, then this
    function will log that in the file, so that there are no errors when updating the webpage.
*/
async function initializeNewGame(){
    await constructNewGameState();
    await updateGameState();
    await resetGameState();
    await assignPlayerTokens();
    await initGame();
}
gameButton.addEventListener("click", gameToggle);

/*
    The following function will completely reset the game and its game file, essentially
    starting a new game.
*/
async function resetGame() {
    gameButton.textContent = "CLEAR";
    await updateGameState(); 
    await initGame(); 
    await formatCellsForGame();
    updateGameStateInterval();
}

/*
    Since we are using a file picker to maintain the game information, this function will
    be used to update the game file. If a new game is starting, and the players have not
    been assigned a game token, then a dice is rolled and compared to the two guesses that
    were submitted.
*/
async function resetGameState() {
    await updateGameState();
    if(startOfNewGame && (presentGame.assignP1[0] === false && presentGame.assignP2[0] === false)){
        await updateGameFile();
        await updateGameState();
        return;
    }
    if(startOfNewGame && (presentGame.assignP1[0] && presentGame.assignP2[0])){
        await updateGameFile(); 
        await updateGameState(); 
        return;
    }
}
diceValueFromAutoRoll.addEventListener("keydown", async (event) => {
    if(event.key === "Enter"){
        await rollStartingDice();
    }
});

/*
    This function creates a JSON file, and makes sure it's selected so that it can manage the
    game state.
*/
async function constructNewGameState(){
    const chosenOptions = {
        types: [{       
            description: 'JSON Files',
            accept : {'application/json': ['.json']}
        }],
        fileOption: true,
    };
    [gameFileFlag] = await window.showOpenFilePicker(chosenOptions);
    const errorBool = await errorFlag(gameFileFlag);
    if(errorBool !== false){
        let fileData = await gameFileFlag.getFile();
    }
    else{
        return;
    }
}

/**
 * @returns {void}
 */
async function assignPlayerTokens(){
    if(startOfNewGame){
        await updateGameState();
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

async function updateGameFile(){
    const gameStateFile = await gameFileFlag.createWritable();    
    gameContents = JSON.stringify(emptyGameState);
    await gameStateFile.write(gameContents);
    await gameStateFile.close();
}

async function updateGameState(){
    const currFile = await gameFileFlag.getFile();
    gameContents = await currFile.text();
    presentGame = JSON.parse(gameContents);
}

async function updateGameFileState(){
    const permission = await gameFileFlag.requestPermission({ mode: 'readwrite' });
    if(permission !== 'granted'){
        return;
    }
    const currFile = await gameFileFlag.createWritable();
    console.log("Current board before write:", presentGame.board);
    gameContents = JSON.stringify(presentGame);
    await currFile.write(gameContents);
    await currFile.close();
}

async function errorFlag(gameFileFlag){
    if(!gameFileFlag){
        let leave = (event) => {
            if(event.keyCode === 27){
                return;
            }
        };
        document.addEventListener("keydown", leave);
        constructNewGameState();
        return false;
    }
    const fileData = await gameFileFlag.getFile();
    if(fileData.name !== "gameState.json"){
        let leave = (event) => {
            if(event.keyCode === 27){
                return;
            }
        };
        document.addEventListener("keydown", leave);
        constructNewGameState();
        return false;
    }
    return fileData;
}

function presentPlayers(){
    if((presentGame.p1DiceGuess !== null && presentGame.p2DiceGuess !== null) && !gameFlag){
        gameFlag = true;
        changeBoardVisibility();
    }
    if((presentGame.assignP1[1] === presentGame.currPlayer) && P1){
        playerTurnText.textContent = `Player One you are ${presentGame.assignP1[1]} your turn to move!`;
    }
    else if((presentGame.assignP2[1] === presentGame.currPlayer) && P2){
        playerTurnText.textContent = `Player Two you are ${presentGame.assignP2[1]} your turn to move!`;
    }
    else{
        playerTurnText.textContent = `waiting for opponent's turn...`;
    }
}

async function getPlayerUserInputFromdiceValueFromAutoRoll(){
    const diceValueFromAutoRoll = document.getElementById("diceValueFromAutoRoll").value;
    return parseInt(diceValueFromAutoRoll);
}

async function rollStartingDice(){
    await updateGameState();
    const guess = await getPlayerUserInputFromdiceValueFromAutoRoll();
    if(isNaN(guess) || guess < 1 || guess > 6){
        return;
    }
    if(P1 === true){
        presentGame.p1DiceGuess = guess;
        await updateGameFileState();
    }
    else if(P2 === true){
        presentGame.p2DiceGuess = guess;
        await updateGameFileState();
    }
    if(presentGame.p1DiceGuess === null || presentGame.p2DiceGuess === null){
        playerTurnText.textContent = `Waiting for player guess`;
        return;
    }

    twoGuessSubmissions = true;
    if(presentGame.diceRoll === null){
        presentGame.diceRoll = Math.floor(Math.random() * 6) + 1;
    }

    const playerOneDiff = Math.abs(presentGame.diceRoll - presentGame.p1DiceGuess);
    const playerTwoDiff = Math.abs(presentGame.diceRoll - presentGame.p2DiceGuess);
    if(twoGuessSubmissions && (playerOneDiff < playerTwoDiff)){
        presentGame.currPlayer = "O";
        presentGame.assignP1[1] = "O";
        presentGame.assignP2[1] = "X";

    }
    else if(playerOneDiff === playerTwoDiff){
        presentGame.diceRoll = "null";
        await updateGameFileState();
        return;

    }
    else{
        presentGame.currPlayer = "O";
        presentGame.assignP2[1] = "O";
        presentGame.assignP1[1] = "X";
    }

    if(twoGuessSubmissions){       
        clearInterval(syncToJSON);
    }

    await updateGameFileState();
    await updateGameState(); 
    if(twoGuessSubmissions){
        updateGameStateInterval();
    }

    removePlayerGuessingBox();
    if(twoGuessSubmissions){
        formatCellsForGame();
        gameButton.addEventListener("click", gameToggle);
    }
}

function updateGameStateInterval(){
    syncToJSON = beginInterval(() => {
        presentPlayers();
    }, 250);
}

function removePlayerGuessingBox(){
    if(twoGuessSubmissions){
        document.getElementById("gameDice").style.display = "none";
    }
}

async function initGame(){
    await updateGameState();
    if(!gameFlag){
        gameFlag = true;
        changeBoardVisibility();
    }

    playerTurnText.textContent = `Please enter your guess!`;
    if(P1){
        playerTurnText.textContent = `You are PLAYER 1 - Enter guess.`;
    }
    else if(P2){
        playerTurnText.textContent = `You are PLAYER 2 - Enter guess.`;
    }

    if(presentGame.assignP1[1] !== "" && presentGame.assignP2[1] !== ""){
        initializeGameStateForNewGame();
        presentGame.winner = null;
        await updateGameFileState();
    }
    else{
        document.getElementById("gameDice").style.display = "block";
    }
}

function initializeGameStateForNewGame(){
        presentGame.board = ["", "", "", "", "", "", "", "", "" ];
        if(presentGame.winner !== null){
            presentGame.currPlayer = presentGame.winner;
        }

        presentGame.victoryCombination = null;
        presentGame.p1DiceGuess = null;
        presentGame.p2DiceGuess = null;
        presentGame.diceRoll = null;
}

async function formatCellsForGame(){
    cells.forEach(cell => cell.removeEventListener("click", cellClicked));
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    cells.forEach(color => color.style.color = "white");
}

/**
 * @param {MouseEvent} event
*/
async function cellClicked(event){
    const cellIndex = event.target.getAttribute("cellIndex");
    if(presentGame.board[cellIndex] != "" || !gameFlag ){
        return;
    }
    await updateCells(event.target, cellIndex);
    await updateGameFileState();
    await confirmVictory();
}

/**
 * @param {number} index
 * @param {html} cell
 */
async function updateCells(cellClicked, index){
    presentGame.board[index] = presentGame.currPlayer;
    cells[index].textContent = presentGame.currPlayer;
}


function updateGameBoardWithGameState() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = presentGame.board[i];
    }

    if(presentGame.victoryCombination !== null){
        changeWinnerColors(presentGame.victoryCombination);
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile); 
        playerTurnText.textContent = `${presentGame.currPlayer} wins! Press Clear to restart game`;

        gameFlag = false; // set gameFlag to false so that the game is not gameFlag anymore
    }
    else if(!presentGame.board.includes("")){
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile); 
        playerTurnText.textContent = `Draw! Press Clear to restart game`;
        gameFlag = false;
    }
}

async function confirmVictory(){
    let roundWon = false;
    roundWon = await checkForThreeInARow(presentGame.board);
    if(roundWon){
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile); 
        playerTurnText.textContent = `${presentGame.currPlayer} wins!`;
        gameFlag = false;
        if(P1 && (presentGame.winner !== "O")){
            presentGame.assignP1[1] = "O";
            presentGame.assignP2[1] = "X";
            presentGame.winner = "O";
            await updateGameFileState();
        }
        else if(P2 && (presentGame.winner !== "O")){
            presentGame.assignP2[1] = "O";
            presentGame.assignP1[1] = "X";
            presentGame.winner = "O";
            await updateGameFileState();
        }
    }
    else if(!presentGame.board.includes("")){
        clearInterval(syncToJSON);
        clearInterval(importFromFile); 
        clearInterval(loadToFile); 
        playerTurnText.textContent = `Draw!`;
        gameFlag = false;
    }
    else if((P1 && presentGame.assignP1[1] === presentGame.currPlayer) || (P2 && presentGame.assignP2[1] === presentGame.currPlayer)){
        await changePlayer();
    }
}


/**
 * @sideEffects
*/
async function changePlayer(){
    movedAction = false;
    if(presentGame.currPlayer === "O"){
        presentGame.currPlayer = "X";
    }
    else{
        presentGame.currPlayer = "O";
    }
    clearInterval(importFromFile); 
    clearInterval(loadToFile); 
    await updateGameFileState();
    movedAction = false; 
    await formatCellsForGame();
}

/**
 * @param {number[]} condition
 */
function changeWinnerColors(condition){
    cells[condition[0]].style.color = "red";
    cells[condition[1]].style.color = "red";
    cells[condition[2]].style.color = "red";
}

function changeBoardVisibility(){
    if(currGame){
        document.getElementById("cellContainer").style.visibility = "visible";
    }
    else{
        document.getElementById("cellContainer").style.visibility = "hidden";
    }
}

function restartCellStatus(){
    cells.forEach(cell => cell.textContent = "");
    gameButton.textContent = "START";
    if(presentGame.winner === null){
        presentGame.winner = "O";
        playerTurnText.textContent = `No winner!`;
    }
}