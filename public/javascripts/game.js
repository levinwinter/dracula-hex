var game = function(id) {
    this.playerRed = null,
    this.playerGreen = null
};

module.exports = game;

/**
 * Newly added are below
 */

const socket = new WebSocket("ws://localhost:3000");

const hexSelector = document.querySelectorAll('.hex');
const hexSelector = document.querySelector('#board').contentDocument.querySelector('hex')
hexSelector.forEach(hx =>{

    hx.addEventListener('click', function() { socket.send(this.id) });

})



// Based on the message from server, the tiles will be colored
function colorTiles(messageArr){
    for(let i = 0; i < messageArr.length; i++){
        let index = i + 1;
        const hex = document.getElementById(index);
        if(messageArr[i] === 1){
            hex.style.color = "#50fa7b";
        }
        if(messageArr[i] === 2){
            hex.style.color = "#ff5555";
        }
    }
}

// Update the number of tiles on board - expects parameter from server
function updateTilesCount(count) {
    const takenNum = docoument.querySelector(".takenNumber");
    takenNum.textContent = count;
}


const timer = document.getElementById("timer");
timer.addEventListener("DOMContentLoaded", startTimer);

let start;
let timePassed;
let totalTime; 

function startTimer(){
    start = Date.now();
    totalTime = setInterval(function showTime(){
        timePassed = Date.now() - start;
        document.getElementById("timer").innerHTML = setTimer(timePassed);
        // timer.innerHTML = setTimer(timePassed);
    }, 1000);
}


function setTimer(time){
    let difHrs = time / 3600000;
    let hours = Math.floor(diffInHrs);
    let difMin = (difHrs - hours) * 60;
    let min = Math.floor(difMin);
    let difSec = (difMin - min) * 60;
    let sec = Math.floor(difSec);

    let hrString = hours.toString().padStart(2, "0");
    let minString = min.toString().padStart(2, "0");
    let secString = sec.toString().padStart(2, "0");

    return `${hrString}:${minString}:${secString}`;

}


// will wait on a message from server to say that someone won 
function notifyEnd(color){
    gameOver(color);
}

function gameOver(winColor){
    let announce = document.createElement('h1');
    announce.textContent = `${winColor} has won the game!`;
    resetButton = document.createElement('button');
    resetButton.textContent = 'Start a new game';
    document.body.appendChild(resetButton);
    resetButton.addEventListener('click', resetGame);

    clearInterval(totalTime);
    timer.innterHTML = "00:00:00";
}



socket.onmessage = function(event){
    //target.innerHTML = event.data;
};

socket.onopen = function(){
    // start = new Date();
    socket.send("Hello from the client!");
    //target.innerHTML = "Sending a first message to the server ...";
};

socket.send("tile 3 has been clicked!");
