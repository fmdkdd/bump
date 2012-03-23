(function() {
	window.addEventListener('load', init);

	function init() {
		var names = document.getElementById('names').getElementsByTagName('li');
		for (var i = 0; i < names.length; ++i) {
			if (names[i].innerHTML === 'all')
				names[i].addEventListener('click', selectAll);
			else
				names[i].addEventListener('click', select);
			names[i].addEventListener('click', refresh);
		}
	}

	function select() {
		clearSelection();

		if (this.innerHTML === 'all')
			selectAll();
		else {
			this.className = 'selected';
			selected[this.innerHTML] = true;
		}
	}

	function selectAll() {
		var names = document.getElementById('names').getElementsByTagName('li');
		for (var i = 0; i < names.length; ++i) {
			names[i].className = 'selected';
			selected[names[i].innerHTML] = true;
		}
	}

	function clearSelection() {
		var names = document.getElementById('names').getElementsByTagName('li');
		for (var i = 0; i < names.length; ++i) {
			names[i].className = '';
			selected[names[i].innerHTML] = false;
		}
	}

	var selected = {};

	function selectedNames() {
		var names = [];
		for (var name in selected)
			if (selected[name])
				names.push(name);
		return names;
	}

	function refresh() {
		var names = selectedNames();
		if (names.length > 0) {
			combineStats(names, function(stats) {
				clearChart();
				dotChart(parseStats(stats));
			});
		}
	}

	function combineStats(players, callback) {
		var last = players.pop();
		request('/api/stats/' + last, function(stats) {
			if (players.length === 0)
				callback(stats);
			else
				combineStats(players, function(combinedStats) {
					callback(stats.concat(combinedStats));
				});
		});
	}

	function parseStats(stats) {
		var dayHours = repeat(0, 5 * 17);

		stats.forEach(function(bump) {
			var date = new Date(bump.time);
			var day = date.getDay() - 1;
			var hour = date.getHours();
			if (hour >= 7)
				++dayHours[day * 17 + (hour - 7)];
		});

		return dayHours;
	}

	function request(url, callback) {
		var xh = new XMLHttpRequest();
		xh.onreadystatechange = function() {
			if (xh.readyState === 4) {
            callback(JSON.parse(xh.response));
			}
		};
		xh.open('GET', url, true);
		xh.send(null);
	}

	function clearChart() {
		var div = document.getElementById('dotchart');
		while (div.firstChild !== null)
			div.removeChild(div.firstChild);
	}

	function dotChart(data) {
		var r = Raphael('dotchart');
      var xs = heighten(seq(0, 17), 5);
		var ys = widen(seq(0, 5), 17);

		var axisy = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
		var axisx = ['7', '8', '9', '10', '11', '12', '13', '14',
						 '15', '16', '17', '18', '19', '20', '21', '22', '23'];

      r.dotchart(30, 10, 680, 200, xs, ys, data, {
			symbol: 'o',
			max: 10,
			heat: false,
			axis: '0 0 1 1',
			axisxstep: 16,
			axisystep: 4,
			axisxlabels: axisx,
			axisxtype: ' ',
			axisytype: ' ',
			axisylabels: axisy
		}).hover(function() {
         this.marker = this.marker ||
				r.tag(this.x, this.y, this.value, 0, this.r + 2)
				.insertBefore(this)
				.attr('font-family', 'MarioBros');
         this.marker.show();
      }, function() {
         this.marker && this.marker.hide();
      }).attr({
			'font-family': 'MarioBros',
			'fill': '#eee'
		}).transform('s1.3')
			.forEach(function(set) {
				set.forEach(function(el) {
					if (el.type === 'circle')
						el.attr('fill', '#fdc');
				});
			});
	}

	function seq(a, b) {
		var arr = [];
		while (b > a) {
			arr.push(a);
			++a;
		}

		return arr;
	}

	function repeat(x, n) {
		var arr = [];
		while (n > 0) {
			arr.push(x);
			--n;
		}

		return arr;
	}

	function widen(list, n) {
		return list
			.map(function(x) { return repeat(x, n); })
			.reduce(function(prev, curr) { return prev.concat(curr); });
	}

	function heighten(list, n) {
		return repeat(list, n)
			.reduce(function(prev, curr) { return prev.concat(curr);});
	}

})();
