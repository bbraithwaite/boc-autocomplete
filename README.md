# boc-autocomplete

A minimal, AJAX autocomplete with no dependencies.

Tested with:

* Chrome
* Safari
* Safari iOS

Works with:

* Mouse
* Keyboard (arrow keys for selection)

Only 2kb minified.


## Example

```
<input type="search" id="autocomplete" placeholder="Search...">
```

Initial search input:

```
new Autocomplete(document.getElementById('autocomplete'), { 
	url: '/api', 
	param: 's',
	label: 'title',
	select: function(item) {
		// Do something with the selected item...
		console.log(item);
	}
});
```

## See it working

Clone the repository.

Run:

```
npm install
npm start
```

Navigate to:

http://localhost:3000/index.html

**Work in progress.**