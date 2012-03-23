var app = require('express').createServer();
var io = require('socket.io').listen(app);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Webserver

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/www/index.html');
});

app.get('/api/stats/:name', function (req, res) {
	fetchStats(req.params.name, function(stats) {
		res.send(stats);
	});
});

app.get(/\/(.+)/, function (req, res) {
	res.sendfile(__dirname + '/www/' + req.params);
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Socket.IO

// Authentication

io.configure(function() {
	// XXX: Log level can be set only when called first.
	io.set('log level', 2);

	io.set('authorization', function(handshakeData, callback) {
		handshakeData.nickname = nickname(handshakeData.address.address);

		callback(null, true);
	});
});

var whitelist = {
	'127.0.0.1': 'fmk',
	'172.16.21.190': 'fmk',
	'172.16.21.188': 'mrw',
	'172.16.21.186': 'thb',
	'172.16.21.184': 'alx',
	'172.16.21.182': 'glm',
	'172.16.21.179': 'bam',
};

function nickname(ip) {
	return whitelist[ip];
}

// Bump!

io.sockets.on('connection', function(socket) {
	db.forEach(function(key, val) {
		socket.emit('player update', {
			'name': key,
			'score': val.score,
			'coin': randomCoins(key)
		});
	});

	socket.on('bump', function() {
		var name = socket.handshake.nickname;
		if (name) {
			var update = {
				'name': name
			};

			if (db.get(name) === undefined)
				update.coin = randomCoins(name);

			bumpAndSave(name);
			update.score = db.get(name).score;

			io.sockets.emit('player update', update);
		}
	});

	socket.on('stats', function(data) {
		fetchStats(data.player, function(stats) {
			socket.emit('stats', stats);
		});
	});
});

function bumpAndSave(name) {
	var score = 0;
	if (db.get(name) !== undefined)
		var score = db.get(name).score;

	db.set(name, {
		'score': score + 1,
		'time': Date.now()
	});
}

var fs = require('fs');

// Return all entries for player in the db file
function fetchStats(player, callback) {
	fs.readFile(dbFile, 'utf8', function(err, content) {
		var lines = content.split('\n');
		var stats = lines
			.filter(nonEmpty)
			.map(JSON.parse)
			.filter(playerBump)
			.map(extractStats);
		callback(stats);

		function nonEmpty(line) {
			return line.length > 0;
		}

		function playerBump(bump) {
			return bump.key === player && bump.val.time !== undefined;
		}

		function extractStats(bump) {
			return {
				'score': bump.val.score,
				'time': bump.val.time
			};
		}
	});
}

const coins = [
	"chest.png",
	"cloud.png",
	"coin.png",
	"flower.png",
	"flute.png",
	"frog.png",
	"hammer.png",
	"leaf.png",
	"leaf2.png",
	"mushroom.png",
	"mushroom2.png",
	"musicbox.png",
	"note.png",
	"star1.png",
	//"star2.png",
	// "star3.png",
	"tanuki.png",
	"wing.png",
];

var savedCoins = {};

function randomCoins(key) {
	if (savedCoins[key] === undefined)
		savedCoins[key] = randomCoin();
	return savedCoins[key];
}

function randomCoin() {
	var usedCoins = values(savedCoins);

	function notUsed(coin) {
		return usedCoins.indexOf(coin) === -1;
	}

	var freeCoins = coins.filter(notUsed);

	if (freeCoins.length === 0)
		return arrayRandom(coins);
	else
		return arrayRandom(freeCoins);
}

function values(obj) {
	var vals = [];
	for (var key in obj)
		vals.push(obj[key]);
	return vals;
}

function arrayRandom(arr) {
	if (arr.length === 0)
		return null;
	else
		return arr[Math.floor(Math.random() * arr.length)];
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Entry point

const port = 8080;
const dbFile = 'scores.db';

var db = require('dirty')(dbFile);

db.on('load', function() {
	app.listen(port);
});
