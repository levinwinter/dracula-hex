const socket = new WebSocket("ws://localhost:3000");
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

    switch(gameState.state){
        case "RUNNING": if(totalTime === undefined) {
            startTimer(gameState.startedAt);
            setPlayerRole(gameState.player);
        }    
        break;
        case "WON": clearInterval(totalTime);  break;
        default:
            break;
    }
}

/**
 * Adds event listeners for event 'click' to each tile
 */
document.addEventListener('DOMContentLoaded', () =>{
    let board = document.querySelector('#boardSVG');
    board.addEventListener('load', () =>{
        let tiles = board.contentDocument.querySelectorAll('.tile');
        for(let tile of tiles) tile.addEventListener('click', function(){
            socket.send(this.id.toString().replace("t", ""));
            clickSound.play();
        })
    })
});




/**
 * Colors the tiles of the Hex game board
 * @param {array} board An array indicating the colors of each tile
 */
function updateBoard(board){

    let svgDoc = document.getElementById('boardSVG');
    let hexBoard = svgDoc.contentDocument;

    for(let i = 0; i < board.length; i++){
        if(board[i] === "g"){
            hexBoard.getElementById("t" + i).style.fill = "#50fa7b";
        }
        if(board[i] === "r"){
            hexBoard.getElementById("t" + i).style.fill = "#ff5555";
        }
        if(board[i] === null){
            continue;
        }
        
    }
}


/**
 * Updates the current number of tiles of Hex game board
 * @param {number} count The current number of tiles placed on Hex game board
 */
function updateTilesCount(count) {
    document.getElementById("takenNum").innerHTML = "Pieces on board: " + count;
}


/**
 * Updates the time elapsed of the current game
 * @param {number} start The time current game started in Unix time
 */
function startTimer(start){
    document.getElementById("circle").style.visibility = "hidden";
    totalTime = setInterval(function showTime(){
        let timePassed = new Date(Date.now() - new Date(start));
        document.getElementById("timer").innerHTML = "Time Elapsed : " 
        + timePassed.getUTCHours().toString().padStart(2, "0") + ":" 
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
    if(winColor === null && state === "ABORTED"){
        announce.innerHTML = "The game has been aborted!";
    }
    else if(winColor === null && state === "WAITING"){
        announce.innerHTML = "Waiting on more players...";
    }
    else if(winColor === null && state === "RUNNING"){
        announce.innerHTML = "";
    }
    else{
        winSound.play();
        if(winColor === "green"){
            announce.setAttribute('class', "greenWin");
        }
        else{
            announce.setAttribute('class', "redWin");
        }

        if(winColor === player) announce.innerHTML = "You have won the game!";  
        else announce.innerHTML = "Your opponent has won the game!";
        document.getElementById("timer").innerHTML = "Time Elapsed : 00:00:00";
    }
}


/**
 * Sets the game screen according to the role of the player
 * @param {string} player The player's role in the game as red or green 
 */
function setPlayerRole(player){
    if(player == "red"){
        document.getElementById("player1").innerHTML = "You";
        document.getElementById("player2").innerHTML = "Opponent";
    }
    else{
        document.getElementById("player2").innerHTML = "You";
        document.getElementById("player1").innerHTML = "Opponent";
    }
}





