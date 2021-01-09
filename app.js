var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require("http");
var websocket = require('ws');

var Game = require('./game');
var stats = require('./statistics');
const game = require('./game');

var port = process.argv[2];
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('splash', calculateStats()));
app.get('/how-to-play', (req, res) => res.render('how-to-play'));
app.get('/play', (req, res) => res.render('game'));

app.get('/inc-total', (req, res) => {
  stats.gamesPlayed++;
  res.send('ok');
});
app.get('/inc-total-and-red', (req, res) => {
  stats.gamesPlayed++;
  stats.winsOfRed++;
  res.send('ok');
});

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

var currentGame = new Game();

var server = http.createServer(app);
const wss = new websocket.Server({ server });

wss.on('connection', function connection(ws) {
  console.log('[hex] player connected');
  players.set(ws, currentGame);
  ws.on('close', () => players.delete(ws));

  ws.on('message', (message) => console.log(message));

});

server.listen(port);
