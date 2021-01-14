const socket = new WebSocket("ws://localhost:3000");
var timePassed;
var totalTime; 
var hexBoard = document.getElementById('boardSVG');

/**
 * Responds to messages from Server
 * @param {string} event JSON string format of the Game
 */
socket.onmessage = function (event){

    var gameState = JSON.parse(event.data);
    setGameState(gameState);  

}

/**
 * Updates the Hex game board based on the state of current game
 * @param {string} gameState The current state of the current game 
 */
function setGameState(gameState){
    switch(gameState.state){
        case "WAITING": 
            notify(null, gameState.state);
            break;
        case "RUNNING": 
            notify(null, gameState.state);
            startTimer(gameState.startedAt);
            updateBoard(gameState.board);
            updateTilesCount(gameState.stonesPlaced);
            break;
        case "WON": 
            startTimer(gameState.startedAt);
            updateBoard(gameState.board);
            updateTilesCount(gameState.stonesPlaced);
            notify(gameState.winner, gameState.state); 
            break;
        case "ABORTED":
            notify(null, gameState.state);
            break;
        default:
            break;
    }
}

/**
 * Adds event listeners for event 'click' to each tile
 */
hexBoard.addEventListener("load", function(){
    var svgDoc = hexBoard.contentDocument;
    for(let i = 0; i < 121; i++){
        var hex = svgDoc.getElementById("t" + i);
        hex.addEventListener("click", function(){
            socket.send(this.id.toString().replace("t", ""));
        }, false);
    }
}, false);


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
    totalTime = setInterval(function showTime(){
        timePassed = new Date(Date.now() - new Date(start));
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
 */
function notify(winColor, state){
    let announce = document.getElementById("notify");
    announce.style.color = "#f1fa8c";
    announce.style.fontFamily = "Courier";
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
        if(winColor === "green"){
            announce.style.color = "#50fa7b";
        }
        else{
            announce.style.color = "#ff5555";
        }
        announce.innerHTML = "Player " + winColor + " has won the game!";
        document.getElementById("timer").innerHTML = "Time Elapsed : 00:00:00";
    }
}

