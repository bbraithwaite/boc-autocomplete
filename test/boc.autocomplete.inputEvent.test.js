'use strict';

/*
 * Unit tests for lib/boc-autocomplete.js control input event.
 */

describe('boc.autocomplete.inputEvent', function() {

  var ulFixture = function(liCount) {
    var ul = document.createElement('ul');
    for (var i = 0; i < liCount; i++) {
      var li = document.createElement('li');
      li.innerHTML = i;
      ul.appendChild(li);  
    }

    return ul;
  };

  var mockJsonHttp = JsonHttp.prototype;
  var autocompleteInstance;
  var searchInput;
 
  // add html fragments to page
  beforeEach(function() {
    document.body.insertAdjacentHTML(
      'afterbegin', 
      '<div id="fixture"><input type="search" id="autocomplete"></div>');
    
    searchInput = document.getElementById('autocomplete');
    autocompleteInstance = new Autocomplete(searchInput, {});
    testUtils.createMock(mockJsonHttp);
  });

  // remove the html fixture from the DOM
  afterEach(function() {
    mockJsonHttp.restore();
    document.body.removeChild(document.getElementById('fixture'));
  });

  describe('on server error', function() {

    it('should set placeholder to indicate error', function() {
      var jsonHttp = {
        get: function(url, callback) {
          url.should.equal('http://localhost/s=foo');
          callback('error', null);
          thisArg.input.placeholder.should.equal('error fetching data...');
          thisArg.input.value.should.equal('');
        }
      };

      var thisArg = {
        input: {
          value: 'foo'
        },
        placeholder : '',
        options: {
          url : 'http://localhost/s='
        },
        ul: ulFixture(0),
        jsonHttp : jsonHttp
      };

      autocompleteInstance.inputEvt.call(thisArg);
    });

  });

  describe('on server data response', function() {

    it('should populate options', function(done) {

      var jsonHttp = {
        get: function(url, callback) {
          url.should.equal('http://localhost/s=foo');
          callback(null, [{ 
              id: 0, 
              title: 'Beverages', 
              description: 'Soft drinks, coffees, teas, beers, and ales' 
            },
            { 
              id: 1, 
              title: 'Condiments', 
              description: 'Sweet and savory sauces and seasonings' 
            }]);

          thisArg.ul.children.length.should.equal(2);
          thisArg.ul.children[0].innerHTML.should.equal('Beverages');
          thisArg.ul.children[1].innerHTML.should.equal('Condiments');
          done();
        }
      };

      var thisArg = {
        input: {
          value: 'foo'
        },
        placeholder : '',
        options: {
          url :   'http://localhost/s=',
          label:  'title'
        },
        ul: ulFixture(0),
        jsonHttp: jsonHttp
      };

      autocompleteInstance.inputEvt.call(thisArg);
    });

    it('should register option click event', function(done) {
      
      var jsonHttp = {
        get: function(url, callback) {
          callback(null, [{ 
              id: 0, 
              title: 'Beverages', 
              description: 'Soft drinks, coffees, teas, beers, and ales' 
            },
            { 
              id: 1, 
              title: 'Condiments', 
              description: 'Sweet and savory sauces and seasonings' 
            }]);

          // init option click event
          var evt = document.createEvent('MouseEvent');
          evt.initEvent('click', true, false);
          thisArg.ul.children[1].dispatchEvent(evt);
        }
      };

      var thisArg = {
        input: {
          value: 'foo'
        },
        placeholder : '',
        options: {
          url :   'http://localhost/s=',
          label:  'title'
        },
        ul: ulFixture(0),
        jsonHttp : jsonHttp,
        select: function(that, option) {
          var json = '{"id":1,"title":"Condiments",' + 
            '"description":"Sweet and savory sauces and seasonings"}';
          option.dataset.item.should.eql(json);
          done();
        }
      };

      autocompleteInstance.inputEvt.call(thisArg);
    });

  });

  describe('option selected event', function() {

    it('should set input value to selection', function(done) {

      searchInput.value = 'Bev';

      var item = {
        title: 'Beverages',
        id: 1
      };

      var thatArg = {
        input: searchInput,
        ul: ulFixture(3),
        options: {
          select: function(selected) {
            selected.should.eql(item);
            thatArg.input.value.should.equal('Beverages');
            done();
          }
        }
      };

      var option = document.createElement('li');
      option.innerHTML = 'Beverages';
      option.setAttribute('data-item', JSON.stringify(item));

      autocompleteInstance.select(thatArg, option);
    });

  });

});