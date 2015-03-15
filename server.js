'use strict';

var express = require('express');
var app = express();
var port = (process.env.PORT || 3000);

app.get('/api', function(req, res) {
	
	var a = { 
		id: 0, 
		title: 'Beverages', 
		description: 'Soft drinks, coffees, teas, beers, and ales' 
	};
	var b = { 
		id: 1, 
		title: 'Condiments', 
		description: 'Sweet and savory sauces, relishes, spreads, and seasonings' 
	};
	var c = { 
		id: 2, 
		title: 'Confections', 
		description: 'Desserts, candies, and sweet breads' 
	};
	var d = { 
		id: 3, 
		title: 'Dairy Products', 
		description: 'Cheeses' 
	};
	var e = { 
		id: 4, 
		title: 'Grains/Cereals', 
		description: 'Breads, crackers, pasta, and cereal' 
	};

	var result = [];

	// some silly test data
	if (req.query.s.length === 1) {
		result.push(a);
	}

	if (req.query.s.length === 2) {
		result.push(a);
		result.push(b);
	}

	if (req.query.s.length === 3) {
		result.push(a);
		result.push(b);
		result.push(c);
	}

	if (req.query.s.length === 4) {
		result.push(a);
		result.push(b);
		result.push(c);
		result.push(d);
	}

	if (req.query.s.length > 4) {
		result.push(a);
		result.push(b);
		result.push(c);
		result.push(d);
		result.push(e);
	}

	// simulate i/o
	setTimeout(function() {
		res.json(result);	
	}, 500);
});

app.use('/index.html', express.static(__dirname + '/index.html'));
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/build', express.static(__dirname + '/build'));

app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:' + port);	
});