const socket = new WebSocket((window.location.protocol === "https:" ? "wss://" : "ws://") + window.location.host);
let clickSound = new Audio("../data/click.wav");
let winSound = new Audio("../data/win.wav");
var totalTime; 

/**
 * Responds to messages from Server
 * @param {string} event JSON string format of the Game
 */
socket.onmessage = function (event){
    let gameState = JSON.parse(event.data);
    setGameState(gameState);
}

/**
 * Updates the Hex game board based on the state of current game
 * @param {string} gameState The current state of the current game 
 */
function setGameState(gameState){
    updateBoard(gameState.board);
    updateTilesCount(gameState.stonesPlaced);
    notify(gameState.winner, gameState.state, gameState.player);
    setPlayerRole(gameState.player);
    switch(gameState.state){
        case "RUNNING": if (totalTime === undefined) startTimer(gameState.startedAt); break;
        case "ABORTED": case "WON": clearInterval(totalTime);  break;
        default: break;
    }
}

/**
 * Adds event listeners for event 'click' to each tile
 */
document.addEventListener('DOMContentLoaded', () =>{
    let board = document.querySelector('#boardSVG');
    board.addEventListener('load', () =>{
        let tiles = board.contentDocument.querySelectorAll('.tile');
        for (let tile of tiles) tile.addEventListener('click', function() {
            socket.send(this.id.toString().replace("t", ""));
            clickSound.play();
        })
    })
});

/**
 * Colors the tiles of the Hex game board
 * @param {array} board An array indicating the colors of each tile
 */
function updateBoard(board) {
    let svgDoc = document.getElementById('boardSVG');
    let hexBoard = svgDoc.contentDocument;
    for (let i = 0; i < board.length; i++) {
        let tile = hexBoard.getElementById("t" + i);
        if(board[i] === "g") tile.style.fill = "#50fa7b";
        if(board[i] === "r") tile.style.fill = "#ff5555";
    }
}

/**
 * Updates the current number of tiles of Hex game board
 * @param {number} count The current number of tiles placed on Hex game board
 */
function updateTilesCount(count) {
    document.getElementById("takenNum").innerHTML = "Pieces on Board : " + count.toString().padStart(2, "0");
    let red = document.querySelector(".hexagon.red");
    let green = document.querySelector(".hexagon.green");
    if (count % 2 === 0) {
        red.classList.remove("waiting");
        red.classList.add("hasTurn");
        green.classList.remove("hasTurn");
        green.classList.add("waiting");
    } else {
        green.classList.remove("waiting");
        green.classList.add("hasTurn");
        red.classList.remove("hasTurn");
        red.classList.add("waiting");
    }
}

/**
 * Updates the time elapsed of the current game
 * @param {number} start The time current game started in Unix time
 */
function startTimer(start){
    document.querySelector("#spin > .hexagon#breath").style.visibility = "hidden";
    totalTime = setInterval(function showTime(){
        let timePassed = new Date(Date.now() - new Date(start));
        document.getElementById("timer").innerHTML = "Time Elapsed : " 
        + timePassed.getUTCMinutes().toString().padStart(2, "0") + ":" 
        + timePassed.getUTCSeconds().toString().padStart(2, "0");
    }, 1000);
}

/**
 * Notifies all players of the current state of Hex game
 * @param {string} winColor The color of Player who won the game
 * @param {string} state The current state of the game
 * @param {string} player The current player connected to this socket
 */
function notify(winColor, state, player){
    let announce = document.getElementById("notify");
    if (winColor === null && state === "ABORTED") announce.innerHTML = "The game has been aborted!";
    else if (winColor === null && state === "WAITING") announce.innerHTML = "Waiting for a second player...";
    else if (winColor === null && state === "RUNNING") announce.innerHTML = "";
    else {
        winSound.play();
        if (winColor === player) {
            announce.classList.add("green");
            announce.innerHTML = "You have won the game!";  
        } else {
            announce.classList.add("red");
            announce.innerHTML = "Your opponent has won the game!";
        }
    }
}

/**
 * Sets the game screen according to the role of the player
 * @param {string} player The player's role in the game as red or green 
 */
function setPlayerRole(player){
    if (player == "red") {
        document.getElementById("player1").innerHTML = "You";
        document.getElementById("player2").innerHTML = "Opponent";
    } else {
        document.getElementById("player2").innerHTML = "You";
        document.getElementById("player1").innerHTML = "Opponent";
    }
}
