/*
    Assignment Name         - Exercise 2
    Author                  - Samuel Mouradian
    Class Name              - Computer Science 491.691.2001
    Assignment Due Date     - 06.14.2025    
*/

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

class TTT{
    /**
     * @param {string} currPlayer               - Registers the current player, which will be X (you) or O (the bot).
     * @param {string[]} boardArray             - An array that contains the current state of the board.
     * @param {boolean} currGame                - A flag that registers whether or not a game is being played.
     * @param {number[][]} victoryCombinations  - A 2D array of all the cells on the board, and their various combinations to secure a win.
     * @param {html} cells                      - Registers all the cells on the game board.
     * @param {html} startButton                - Selects button with ID "start" to start the game (bot goes first in this instance).
     * @param {html} clearButton                - Selects button with ID "clear" to clean the board.
     * @param {MouseEvent} click                - Gives the web page the ability to know when a user is clicking a button.
     */

    constructor(cells, startButton, clearButton){
        this.cells = Array.from(cells);     // Registers the cells from the html file
        this.startButton = startButton;     // Registers the start button from the html file
        this.clearButton = clearButton;     // Registers the clear button from the html file
        this.victoryCombinations = [        // Possible Win Conditions
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        this.boardArray = ["", "", "", "", "", "", "", "", ""];
        this.currPlayer = "X";
        this.currGame = false;

        this.selectedCell = this.selectedCell.bind(this);
        this.startGame = this.startGame.bind(this);
        this.reset = this.reset.bind(this);

        this.startButton.addEventListener("click", this.startGame);
        this.clearButton.addEventListener("click", this.reset);        
    }

    startGame(){                    // The game flag is set to true, and the game begins with the bot filling in two spaces.
        if(this.currGame){
            return;
        }
        this.currGame = true;
        this.boardArray = this.boardArray = ["", "", "", "", "", "", "", "", ""];
        this.cells.forEach(cell => {
            cell.textContent = "";
            cell.style.color = "white";
            cell.style.backgroundColor = "";
            cell.addEventListener("click", this.selectedCell);
        });
    }

    selectedCell(click){            // Allows the player to select a cell on their turn.
        const cell = click.target;
        const index = parseInt(cell.getAttribute("cellInex"));
        if(this.boardArray[index] != "" || !this.currGame){
            return;
        }
        this.boardArray[index] = this.currPlayer;
        cell.textContent = this.currPlayer;
        this.checkForVictory();
        if(this.currGame){
            this.changePlayer();
        }
    }

    changePlayer(){                 // Assigns the X's and O's to each player.
        this.currPlayer = this.currPlayer == "X" ? "O" : "X";
        if(this.currPlayer == "O"){
            this.botSelection();
        }
    }

    async botSelection(){           // Function created for the computer bot to actually play the game properly.
        await sleep(300);
        let emptyIndices = this.boardArray.map((val, idx) => (val === "" ? idx : null)).filter(val => val !== null);
        if(emptyIndices.length == 0){
            return;
        }
        const choice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        this.boardArray[choice] = "O";
        this.cells[choice].textContent = "O";
        this.checkForVictory();
        if(this.currGame){
            this.changePlayer();
        }
    }

    checkForVictory(){              // Checks to see if the computer or the player won the game.
        for(let condition of this.victoryCombinations){
            const [a, b, c] = condition;
            if(this.boardArray[a] && this.boardArray[a] == this.boardArray[b] && this.boardArray[b] == this.boardArray[c]){
                this.currGame = false;
                [a, b, c].forEach(i => this.cells[i].style.color = "red");
                return;
            }
        }

        if(this.boardArray.includes("")){
            this.currGame = false;
        }
    }

    reset(){
        this.currPlayer = "X";
        this.currGame = false;
        this.boardArray = ["", "", "", "", "", "", "", "", ""];
        this.cells.forEach(cell => {
            this.cell.textContent = "";
            cell.style.color = "white";
            cell.style.backgroundColor = "";
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const game = new TTT(
        document.querySelectorAll(".cell"),
        document.getElementById("startButton"),
        document.getElementById("clearButton")
    );
});