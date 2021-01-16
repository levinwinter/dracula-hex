/**
 * The constructor for an object which represents an instance of a hex game.
 * @param {object} stats The global statistics object.
 */
function Game(stats) {

    this.red = null;
    this.green = null;
    this.winner = null;

    this.state = "WAITING";
    this.gameStartedAt = null;
    this.stonesPlaced = 0;
    this.board = function() {
        let board = [];
        for (let i = 0; i < 11; i++) board[i] = new Array(11).fill(null);
        return board
    }();

    this.stats = stats;

    /**
     * Converts the id of the tile to its x and y coordinates.
     * @param {number} id The id to convert.
     * @return {object} An object with the coordinates as properties.
     */
    this.toXY = function toXY(id) {
        return { x: id % 11, y: Math.floor(id / 11) }
    }

    /**
     * Returns an array containing the coordinates of all tiles adjacent to the input.
     * @param {number} x The x coordinate of the input tile.
     * @param {number} y The y coordinate of the input tile.
     * @returns {array} An array containing the coordinates of all tiles adjacent to the input.
     */
    this.getNeighbours = function getNeighbours(x, y) {
        let neighbours = [];
        if (0 < y) neighbours.push([x, y - 1]);
        if (x < 10 && 0 < y) neighbours.push([x + 1, y - 1]);
        if (0 < x) neighbours.push([x - 1, y]);
        if (x < 10) neighbours.push([x + 1, y]);
        if (0 < x && y < 10) neighbours.push([x - 1, y + 1]);
        if (y < 10) neighbours.push([x, y + 1]);
        return neighbours;
    }

    /**
     * Evaluates whether two sides of the board are connected.
     * @param {number} x The x coordinate of the starting position.
     * @param {number} y The y coordinate of the starting position.
     * @param {string} letter The letter which should connect both sides.
     * @param {function} winningCondition A function that determines whether a tile is a winning tile.
     * @param {array} visited An array indicating which tiles have been visited before.
     */
    this.connected = function(x, y, letter, winningCondition, visited) {
        if (visited === null) {
            visited = [];
            for (let i = 0; i < 11; i++) visited[i] = new Array(11).fill(false);
        }
        if (visited[y][x]) return false;
        if (this.board[y][x] !== letter) return false;
        if (winningCondition(x, y)) return true;
        visited[y][x] = true;
        let neighbours = this.getNeighbours(x, y);
        for (let i = 0; i < neighbours.length; i++) {
            if (this.connected(neighbours[i][0], neighbours[i][1], letter, winningCondition, visited)) return true;
        }
        return false;
    }

    /**
     * Determines whether either player won the game.
     * @returns {string} The name of the player who won the game or null if the match is ongoing.
     */
    this.determineWinner = function() {
        for (let i = 0; i < 11; i++) {
            if (this.connected(0, i, "r", (x, y) => x === 10, null)) return "red";
            if (this.connected(i, 0, "g", (x, y) => y === 10, null)) return "green";
        }
        return null;
    }

    /**
     * Makes the specified move if it is the players turn, the tile is valid and empty, and the game is running.
     * @param {WebSocket} player The player who made the move.
     * @param {number} tile The id of the tile that should be set.
     */
    this.makeMove = function(player, tile) {
        tile = parseInt(tile);
        if (!isFinite(tile) || tile < 0 || 120 < tile) return;
        if (this.state !== "RUNNING") return;
        if (player !== (this.stonesPlaced % 2 === 0 ? this.red : this.green)) return;
        if (this.board[this.toXY(tile).y][this.toXY(tile).x] !== null) return;
        this.board[this.toXY(tile).y][this.toXY(tile).x] = this.stonesPlaced % 2 === 0 ? "r" : "g";
        this.stonesPlaced++;
        this.winner = this.determineWinner();
        if (this.winner !== null) {
            this.state = "WON";
            this.stats.gamesPlayed++;
            if (this.winner === "red") stats.winsOfRed++;
        }
        this.notify();
    }

    /**
     * Adds a player to the game and starts it if two players are present and the game is waiting.
     * @param {WebSocket} player The websocket object of the player that should be added to the game.
     */
    this.addPlayer = function(player) {
        if (this.state !== "WAITING") return;
        if (this.red === null) this.red = player;
        else if (this.green === null) this.green = player;
        else throw new Error("Invalid player assignment");
        player.on("message", data => this.makeMove(player, data));
        if (this.red !== null && this.green !== null) {
            this.state = "RUNNING";
            this.gameStartedAt = Date.now();
        }
        this.notify();
    }

    /**
     * Tries to abort the game and notifies the players about it.
     */
    this.abort = function() {
        if (this.state === "WON" || this.state === "ABORTED") return;
        this.state = "ABORTED";
        this.notify();
    }
    
    /**
     * Assembles the notification object and sends it to the players via the respective websocket.
     */
    this.notify = function() {
        let notification = {
            board: this.board.flat(),
            state: this.state,
            stonesPlaced: this.stonesPlaced,
            startedAt: this.gameStartedAt,
            winner: this.winner
        };
        notification.player = "red";
        if (this.red !== null && this.red.readyState === this.red.OPEN) this.red.send(JSON.stringify(notification));
        notification.player = "green";
        if (this.green !== null && this.green.readyState === this.green.OPEN) this.green.send(JSON.stringify(notification));
    }

}

module.exports = Game;
