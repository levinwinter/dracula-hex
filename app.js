var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var Game = require('./game');
var stats = require('./statistics');

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
app.get('/play', (req, res) => res.render('game.ejs'));

function calculateStats() {
  const relativeWinsRed = stats.winsOfRed === 0 ? 50 : Math.round(stats.winsOfRed / stats.gamesPlayed);
  return {
    playersOnline: 99,
    gamesPlayed: stats.gamesPlayed,
    relativeWinsRed: relativeWinsRed + '%'
  };
}

module.exports = app;
