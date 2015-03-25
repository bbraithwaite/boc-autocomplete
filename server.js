'use strict';

var express = require('express');
var app = express();
var port = (process.env.PORT || 3000);

app.get('/api', function(req, res) {

	var data = [
		{ 'title': 'Beverages', 'description': 'Soft drinks, coffees, teas, beers, and ales' },
		{ 'title': 'Condiments', 'description': 'Sweet and savory sauces, relishes, spreads, and seasonings' },
		{ 'title': 'Confections', 'description': 'Desserts, candies, and sweet breads' },
		{ 'title': 'Dairy Products', 'description': 'Cheeses' },
		{ 'title': 'Grains/Cereals', 'description': 'Breads, crackers, pasta, and cereal' },
		{ 'title': 'Meat/Poultry', 'description': 'Prepared meats' },
		{ 'title': 'Produce', 'description': 'Dried fruit and bean curd' },
		{ 'title': 'Seafood', 'description': 'Seaweed and fish' }];
	
	var result = [];

	data.forEach(function(d) {
		if (d.title.toUpperCase().indexOf(req.query.s.toUpperCase()) !== -1) {
			result.push(d);
		}
	});

	// simulate i/o when running locally
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