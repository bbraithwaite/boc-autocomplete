'use strict';

/*
 * Unit tests for lib/boc-autocomplete.js
 */

describe('boc.autocomplete', function() {

// utility function to restore overridable funcs on prototype
  var override = function(obj) {

    var methods = {};

    for(var index in obj) {
      if (obj.hasOwnProperty(index)) {
        methods[index] = obj[index];
      }
    }

    obj.restore = function() {
      for(var index in this) {
        if (this.hasOwnProperty(index)) {
          this[index] = methods[index];
        }
      }
    };
  };

  var searchInput;
  var mockObj = window.Autocomplete.prototype;

  var keys = {
    RETURN : 13,
    TAB : 9,
    DOWN : 40,
    UP : 38
  };

  var opts = { 
    url: 'http://localhost/api', 
    param: 's',
    value: 'id',
    label: 'title'
  };

  // add html fragments to page
  beforeEach(function() {
    document.body.insertAdjacentHTML(
      'afterbegin', 
      '<div id="fixture"><input type="search" id="autocomplete"></div>');
    searchInput = document.getElementById('autocomplete');
    override(mockObj);
  });

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
    mockObj.restore();
  });

  describe('control initialisation', function() {

    beforeEach(function() {
      new window.Autocomplete(searchInput, opts);
    });

    it('should set autocomplete property to "off"', function() {
      searchInput.autocomplete.should.equal('off');
    });

    it('should set class name property to "autocomplete"', function() {
      searchInput.className.should.equal('autocomplete');
    });
    
    it('should insert url control after input field', function() {
      searchInput.nextSibling.nodeName.should.equal('UL');
      searchInput.nextSibling.className.should.equal('autocomplete');
    });

  });

  describe('control event handler registration', function() {

    var getKeyboardEvent = function(type) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initEvent(type, true, false);
      return evt;
    };
    
    it('should listen to input event', function (done) {
      mockObj.inputListener = function() {
        return function() {
          done();
        };
      };

      new window.Autocomplete(searchInput, opts);

      searchInput.dispatchEvent(getKeyboardEvent('input'));
    });

    it('should listen to keydown event', function (done) {
      mockObj.keydownListener = function() {
        return function() {
          done();
        };
      };

      new window.Autocomplete(searchInput, opts);
      searchInput.dispatchEvent(getKeyboardEvent('keydown'));
    });

    it('should listen to blur event', function (done) {
      mockObj.blurListener = function() {
        return function() {
          done();
        };
      };

      new window.Autocomplete(searchInput, opts);

      searchInput.dispatchEvent(getKeyboardEvent('blur'));
    });

  });

  describe('blur event listener', function() {
    
    it('should clear options if the UL is populated', function() {
      var ul = document.createElement('ul');
      ul.appendChild(document.createElement('li'));
      mockObj.blurListener(ul)();
      ul.children.length.should.equal(0);
    });

    it('should do nothing if UL is empty', function() {
      var ul = document.createElement('ul');
      mockObj.blurListener(ul)();
      ul.children.length.should.equal(0);
    });

  });

  describe('keydown event listener', function() {
    
    var ulFixture = function() {
      var ul = document.createElement('ul');
      for (var i = 0; i < 3; i++) {
        var li = document.createElement('li');
        li.innerHTML = i;
        ul.appendChild(li);  
      }

      return ul;
    };

    var assertOptionSelected = function(ul, selectedIndex) {
      for (var i = ul.children.length - 1; i >= 0; i--) {
        if (i === selectedIndex) {
          ul.children[i].className.should.equal('selected');
        } else {
          ul.children[i].className.should.not.equal('selected');
        } 
      }
    };

    var ul;
    var keydown;

    beforeEach(function() {
      ul = ulFixture();
      keydown = mockObj.keydownListener(ul);
    });

    describe('arrow key behaviour', function() {
      it('should select the first item from default state', function() { 
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(ul, 0);
      });

      it('should not run off the end of the list', function() {
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(ul, 0);
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(ul, 1);
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(ul, 2);
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(ul, 2);
      });

      it('should move up the list', function() {
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.UP });
        assertOptionSelected(ul, 1);
      });

      it('should not move up in default state', function() {
        keydown({ keyCode: keys.UP });
        assertOptionSelected(ul, -1);
      });

      it('should not run off the top of the list', function() {
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.UP });
        keydown({ keyCode: keys.UP });
        keydown({ keyCode: keys.UP });
        assertOptionSelected(ul, -1);
      });
    });

    describe('tab key press', function () {
      it('should prevent default if there are options', function(done) {
        mockObj.select = function() {
        };
        keydown({ 
          keyCode: keys.TAB, 
          preventDefault: done
        });
      });

      it('should not prevent default if there are no options', function(done) {
        var keydown = mockObj.keydownListener(document.createElement('ul'));
        keydown({ 
          keyCode: keys.TAB, 
          preventDefault: function() {
            done('should not be called');
          }
        });
        done();
      });

      it('should choose first option mid-typing', function(done) {
        mockObj.select = function(item) {
          item.innerHTML.should.equal('1');
          item.className.should.equal('selected');
          done();
        };

        // when the tab key is pressed, it should default to select the
        // first item in the options
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.TAB, preventDefault: function() {} });
      });

      it('should choose selected option if not in default state', 
        function(done) {
        mockObj.select = function(item) {
          item.innerHTML.should.equal('0');
          done();
        };

        // when the tab key is pressed, it should default to select the
        // first item in the options
        keydown({ keyCode: keys.TAB, preventDefault: function() {} });
      });
    });

    describe('return key press', function() {
      it('should prevent default if there are options', function(done) {
        mockObj.select = function() {};
        keydown({ 
          keyCode: keys.RETURN, 
          preventDefault: done
        });
      });

      it('should not prevent default if there are no options', function(done) {
        var keydown = mockObj.keydownListener(document.createElement('ul'));
        keydown({ 
          keyCode: keys.RETURN, 
          preventDefault: function() {
            done('should not be called');
          }
        });
        done();
      });

      it('should choose selected option if not in default state', 
        function(done) {
        mockObj.select = function(item) {
          item.innerHTML.should.equal('0');
          done();
        };

        // when the return key is pressed, it should default to select the
        // first item in the options
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.RETURN, preventDefault: function() {} });
      });
    });
  
  });

  describe('input event listener', function() {

    var mockJsonHttp = window.JsonHttp.prototype;

    it('should set placeholder to indicate server error', function() {
      var ul = document.createElement('ul');
      var input = mockObj.inputListener('http://localhost/s=', ul);
      var thisArg = {
        value: 'foo',
        placeholder : ''
      };

      mockJsonHttp.get = function(url, callback) {
        url.should.equal('http://localhost/s=foo');
        callback('error', null);
        thisArg.placeholder.should.equal('error fetching data...');
        thisArg.value.should.equal('');
      };
      input.call(thisArg);
    });

    it('should display expected numer of items', function(done) {
      var ul = document.createElement('ul');
      var input = mockObj.inputListener.call({ 
        opts: opts 
      },
      'http://localhost/s=', ul);
      
      var thisArg = {
        value: 'foo',
      };

      mockObj.select = function() {
        done();
      };

      mockJsonHttp.get = function(url, callback) {
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
        ul.children.length.should.equal(2);
        ul.children[0].innerHTML.should.equal('<span>0</span>Beverages');
        ul.children[1].innerHTML.should.equal('<span>1</span>Condiments');

        var evt = document.createEvent('MouseEvent');
        evt.initEvent('click', true, false);
        ul.children[1].dispatchEvent(evt);
      };
      input.call(thisArg);
    });

  });

});
