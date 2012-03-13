(function() {
	window.addEventListener('load', init);

	var players = {};

	function init() {
		var socket = io.connect();
		socket.on('connect', function() {
			socket.on('new player', function(player) {
				if (document.getElementById(player.name) === null)
					addPlayer(player);
				else
					updateScore(player);

				players[player.name] = {
					name: player.name,
					score: player.score,
					coin: player.coin
				}
			});

			socket.on('bump', function(player) {
				bumpPlayer(player.name);
				updateScore(player);
			});
		});

		document.getElementById('bump')
			.addEventListener('click', function() {
				socket.emit('bump');
			});
	}

	function addPlayer(player) {
		var list = document.getElementById('playerlist');
		var li = document.createElement('li');
		li.id = player.name;
		li.innerHTML = rowHTML(player.name, player.score, player.coin);
		list.appendChild(li);
	}

	function rowHTML(name, score, coin) {
		return name
			+ '<span class="score">' + score + '</span>'
			+ '<img class="coin" src="/img/' + coin + '" />';
	}

	function updateScore(player) {
		var li = document.getElementById(player.name);
		li.innerHTML = rowHTML(player.name, player.score, player.coin);
	}

	function bumpPlayer(name) {
		++players[name].score;
	}

})();
