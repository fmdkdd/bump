(function() {
	window.addEventListener('load', init);

	var players = {};

	function init() {
		var socket = io.connect();
		socket.on('connect', function() {
			socket.on('new player', function(data) {
				addPlayer(data);
			});

			socket.on('bump', function(data) {
				bumpPlayer(players[data.name]);
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

		players[player.name] = {
			name: player.name,
			score: player.score,
			coin: player.coin
		}
	}

	function rowHTML(name, score, coin) {
		return name
			+ '<span class="score">' + score + '</span>'
			+ '<img class="coin" src="/img/' + coin + '" />';
	}

	function bumpPlayer(player) {
		var li = document.getElementById(player.name);
		li.innerHTML = rowHTML(player.name, ++player.score, player.coin);
	}

})();
