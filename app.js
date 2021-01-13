var express = require('express');
var path = require('path');
var logger = require('morgan');
var http = require('http');
var websocket = require('ws');

var Game = require('./game');
var stats = require('./statistics');

var port = process.argv[2];
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('splash', calculateStats()));
app.get('/how-to-play', (req, res) => res.render('how-to-play'));
app.get('/play', (req, res) => res.render('game'));

/**
 * Calculates the statistics which are displayed on the splash screen.
 * @returns {object} An object having the individual statistics as its properties.
 */
function calculateStats() {
    let relativeWinsRed;
    if (stats.winsOfRed === 0 && stats.gamesPlayed === 0) relativeWinsRed = 50;
    else if (stats.winsOfRed === 0 && 0 < stats.gamesPlayed) relativeWinsRed = 0;
    else relativeWinsRed = Math.round(stats.winsOfRed / stats.gamesPlayed * 100);
    return {
        playersOnline: players.size,
        gamesPlayed: stats.gamesPlayed,
        relativeWinsRed: relativeWinsRed + '%'
    };
}

const players = new Map();
var currentGame = new Game(stats);

var server = http.createServer(app);
const wss = new websocket.Server({ server });

wss.on('connection', function connection(ws) {

    if (currentGame.state !== "WAITING") currentGame = new Game(stats);
    players.set(ws, currentGame);
    currentGame.addPlayer(ws);

    ws.on('close', () => {
        let state = players.get(ws).state;
        if (state !== "WON" && state !== "ABORTED") players.get(ws).abort();
        players.delete(ws);
    });

});

server.listen(port);
