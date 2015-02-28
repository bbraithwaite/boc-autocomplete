'use strict';

/*
 * Unit tests for lib/boc-autocomplete.js
 */

describe('boc.autocomplete', function() {

  var autocomplete;

  // add html fragments to page
  beforeEach(function() {
    document.body.insertAdjacentHTML(
      'afterbegin', 
      '<div id="fixture"><input type="text" id="autocomplete"></div>');
  });

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
  });

  // register controls
  beforeEach(function() {
    var opts = { 
      url: '/api', 
      param: 's',
      idField: 'id',
      nameField: 'name'
    };

    autocomplete = document.getElementById('autocomplete');
    window.boc.autocomplete.init(autocomplete, opts);
  });

  it('autocomplete control exists', function() {
    //document.getElementById('autocomplete').should.not.equal(null);
  });

});
