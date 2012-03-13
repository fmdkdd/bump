var app = require('express').createServer();
var io = require('socket.io').listen(app);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Webserver

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/www/index.html');
});

app.get('/:path', function (req, res) {
	res.sendfile(__dirname + '/www/' + req.params.path);
});

app.get('/font/:path', function (req, res) {
	res.sendfile(__dirname + '/www/font/' + req.params.path);
});

app.get('/img/:path', function (req, res) {
	res.sendfile(__dirname + '/www/img/' + req.params.path);
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
};

function nickname(ip) {
	return whitelist[ip];
}

// Bump!

io.sockets.on('connection', function(socket) {
	db.forEach(function(key, val) {
		socket.emit('new player', {
			name: key,
			score: val.score,
			coin: randomCoins[key]
		});
	});

	socket.on('bump', function() {
		if (socket.handshake.nickname) {
			saveBump(socket.handshake.nickname);
			io.sockets.emit('bump', {
				name: socket.handshake.nickname
			});
		}
	});
});

function saveBump(name) {
	var score = db.get(name).score;
	db.set(name, {
		'score': score + 1,
		'time': Date.now()
	});
}

var randomCoins = {};

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
	// "star1.png",
	"star2.png",
	// "star3.png",
	"tanuki.png",
	"wing.png",
];

function randomCoin() {
	return coins[Math.floor(Math.random() * coins.length)];
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Entry point

const port = 8080;
const dbFile = 'scores.db';

var db = require('dirty')(dbFile);

db.on('load', function() {
	db.forEach(function(key, val) {
		randomCoins[key] = randomCoin();
	});

	app.listen(port);
});
