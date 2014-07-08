(function() {
	window.addEventListener('load', init);

	function init() {
		initBumps();

		restorePreviousBumps();

		document.querySelector('#bump').onclick = bump;
	}

	function bump() {
		++localStorage['bumps'];

		appendCoin();
	}

	function initBumps() {
		if (localStorage['bumps'] == null)
			localStorage['bumps'] = 0;
	}

	function restorePreviousBumps() {
		for (var i=0; i < localStorage['bumps']; ++i)
			appendCoin();
	}

	function appendCoin() {
		document.querySelector('#bumps').appendChild(
			img(randomCoin())
		);
	}

	function randomCoin() {
		return choose(['chest',
									 'coin',
									 'cloud',
									 'flower',
									 'flute',
									 'frog',
									 'hammer',
									 'leaf',
									 'leaf2',
									 'mushroom',
									 'mushroom2',
									 'musicbox',
									 'note',
									 'star2',
									 'tanuki',
									 'wing'
									]);
	}

	function choose(array) {
		return array[Math.floor(array.length * Math.random())];
	}

	function img(coin) {
		var h = document.createElement('img');
		h.classList.add('coin');
		h.src = '/img/' + coin + '.png';
		return h;
	}

})();
