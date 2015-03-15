# boc-autocomplete

A minimal, AJAX autocomplete with no dependencies.

Tested with:

* Chrome
* Safari
* Safari iOS


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

**Work in progress.**