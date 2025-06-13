/*
    Assignment Name         - Exercise 2
    Author                  - Samuel Mouradian
    Class Name              - Computer Science 491.691.2001
    Assignment Due Date     - 06.14.2025
*/

(function(){
    /**
     * @param {html} cells                      - Registers all the cells on the game board.
     * @param {html} startButton                - Selects button with ID "start" to start the game (bot goes first in this instance).
     * @param {html} clearButton                - Selects button with ID "clear" to clean the board.
     * @param {html} playerTurn                 - Tells the player whose turn it is.
     * @param {number[][]} victoryCombinations  - A 2D array of all the cells on the board, and their various combinations to secure a win.
     * @param {string} currPlayer               - Registers the current player, which will be X (you) or O (the bot).
     * @param {string[]} boardArray             - An array that contains the current state of the board.
     * @param {boolean} currGame                - A flag that registers whether or not a game is being played.
     * @param {MouseEvent} event                - A flag that lets us know when a valid cell is clicked on the game board.
     * @param {number} index                    - The index of cells in the boardArray.
     * @param {html} cell                       - Cell that was chosen and stored from the selectedCell function.
     * @param {boolean} isBot                   - A flag to check if the active player is the computer. 
     * @param {number[]} tempArray              - Temporary array for easier board implementation.
     * @returns {number|boolean}                - Helps with return values.
     * @param {number[]} condition              - An array of the winning combination. 
     * @param {number} ms                       - Milliseconds for bot.
     * @returns {Promise}
     */
    
    const cells = document.querySelectorAll(".cell");
    const playerTurn = document.querySelector("#playerTurn");
    const clearButton = document.querySelector("#clearButton");
    const startButton = document.querySelector("#startButton");
    const victoryCombinations = [
        [0,1,2], 
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];
    let boardArray = ["", "", "", "", "", "", "", "", "" ];
    let currPlayer = "X";
    let currGame = false;
    let playerAid = false;
    let botPlayer1 = false;

    startGame();
    function startGame(){
        gameMessages();
        startButton.addEventListener("click", createGame);
    }

    function createGame(){
        if(!currGame){
            currGame = true;
        }
        displayActivePlayer();
        buildCells();
        initiateClearButton();
        startButton.removeEventListener("click", createGame);
    }

    function initiateClearButton(){
        if(currGame){
            clearButton.addEventListener("click", reset);
        }
    }

    function buildCells(){
        if(currPlayer === "X"){
            cells.forEach(cell => cell.addEventListener("click", selectedCell));
        }
        else if(currPlayer === "O"){
            botPerformance();
        }
        cells.forEach(color => color.style.color = "black");
    }

    function selectedCell(event){
        const cellNumber = event.target.getAttribute("cellNumber");
        if(boardArray[cellNumber] != "" || !currGame ){
            return;
        }
        updateCells(event.target, cellNumber);
        confirmVictory();
    }

    function updateCells(cell, index){
        boardArray[index] = currPlayer;
        if(cell){
            cell.textContent = currPlayer;
        }
    }

    function changePlayer(){
        if(!playerAid && currGame){
            playerAid = true;
            buildCells();
            return;
        }

        if(currPlayer == "X"){
            currPlayer = "O";
        }
        else{
            currPlayer = "X";
        }

        if(!currGame){
            gameMessages();
            botPlayer1 = !botPlayer1;
            return;
        }
        displayActivePlayer();
        buildCells();
    }

    function displayActivePlayer(){
        playerTurn.textContent = `${currPlayer}'s turn`;
        document.querySelector(".tooltiptext").style.visibility = "hidden";
    }

    function gameMessages(){
        document.querySelector(".tooltiptext").style.visibility = "visible";
    }

    function confirmVictory(){
        let gameWon = false;
        gameWon = checkForWin(false, boardArray);
        if(gameWon){
            currGame = false;
        }
        else if(!boardArray.includes("")){
            currGame = false;
        }
        else{
            changePlayer();
        }
    }

    function checkForWin(isBot, boardArr){ 
        let returnValue = 0;
        for(let i = 0; i < victoryCombinations.length; i++){
            const condition = victoryCombinations[i];
            const c1 = boardArr[condition[0]];
            const c2 = boardArr[condition[1]];
            const c3 = boardArr[condition[2]];

            if(c1 == c2 && c2 == c3 ){
                if(c1 == "" || c2 == "" || c3 == ""){
                    continue;
                }
                if(!isBot){
                    markWinningCombination(condition);
                    return true;
                } 
                else{
                    returnValue = 1;
                }
            } 
        }
        if(!isBot){
            return false;
        }
        return returnValue;
    }

    function markWinningCombination(condition){
        cells[condition[0]].style.color = "red";
        cells[condition[1]].style.color = "red";
        cells[condition[2]].style.color = "red";
    }

    function reset(){
        currPlayer = "X";
        boardArray = Array(9).fill("");
        displayActivePlayer();
        cells.forEach(cell => cell.textContent = "");
        currGame = false;
        playerAid = false;
        startGame();

    }

    async function botPerformance(){
        let botSelection; 
        let bestOutcome = -1;
        let bOI = -1;
        cells.forEach(cell => cell.removeEventListener("click", selectedCell));
        clearButton.removeEventListener("click", reset);
        if (botPlayer1){
            var randNum = Math.floor(Math.random() * 9);
            var randOS = Math.floor(Math.random() * 5);
            await sleep(2000);
            for(let i = 0; i < boardArray.length; i ++){
                if(boardArray[i] == ""){
                    if(randNum === i){
                        botSelection = i;
                        break;
                    }
                    else if(randNum - i >= randOS && randNum - i >= botSelection){
                        botSelection = i;
                    }
                    else{
                        botSelection = i;
                    }
                }
            }
        }

        if(!botPlayer1){
            await sleep(2000);
            for(let i = 0; i < boardArray.length; i++){
                if(boardArray[i] == ""){
                    tempArray = [...boardArray];
                    tempArray[i] = "X";
                    let movesOfX = checkForWin(true, tempArray);
                    tempArray = [...boardArray]; 
                    tempArray[i] = "O";
                    let movesOfO = checkForWin(true, tempArray); 
                    let bestMove = Math.max(movesOfO, movesOfX);
                    if (bestMove > bestOutcome) {
                        bestOutcome = bestMove;
                        bOI = i;
                    }
                }
            }
            botSelection = bOI;
        }
        if(playerAid){
            botPlayer1 = false;
        }
        initiateClearButton();
        boardArray[botSelection] = currPlayer;
        cells[botSelection].textContent = currPlayer;
        confirmVictory();
    }

    function sleep(ms) {
        return new Promise(resolve =>setTimeout(resolve, ms));
    }

}());