'use strict';

/*
 * Unit tests for lib/boc-autocomplete.js
 */

describe('boc.autocomplete', function() {

  // utility function to restore overridable funcs on prototype
  var createMock = function(obj) {

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

  var ulFixture = function(liCount) {
    var ul = document.createElement('ul');
    for (var i = 0; i < liCount; i++) {
      var li = document.createElement('li');
      li.innerHTML = i;
      ul.appendChild(li);  
    }

    return ul;
  };

  var getKeyboardEvent = function(type) {
    var evt = document.createEvent('KeyboardEvent');
    evt.initEvent(type, true, false);
    return evt;
  };

  var searchInput;
 
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
  });

  // remove the html fixture from the DOM
  afterEach(function() {
    document.body.removeChild(document.getElementById('fixture'));
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
    
    var mockAutocomplete = window.Autocomplete.prototype;

    beforeEach(function() {
      createMock(mockAutocomplete);
    });

    afterEach(function() {
      mockAutocomplete.restore();
    });

    it('should listen to input event', function (done) {
      mockAutocomplete.inputListener = function() {
        done();
      };
      new window.Autocomplete(searchInput, opts);
      searchInput.dispatchEvent(getKeyboardEvent('input'));
    });

    it('should listen to keydown event', function (done) {
      mockAutocomplete.keydownListener = function() {
        done();
      };
      new window.Autocomplete(searchInput, opts);
      searchInput.dispatchEvent(getKeyboardEvent('keydown'));
    });

  });

  describe('keydown event listener', function() {
    
    var assertOptionSelected = function(ul, selectedIndex) {
      for (var i = ul.children.length - 1; i >= 0; i--) {
        if (i === selectedIndex) {
          ul.children[i].className.should.equal('selected');
        } else {
          ul.children[i].className.should.not.equal('selected');
        } 
      }
    };

    var keydown;
    var thisArg;

    beforeEach(function() {
      thisArg = {
        ul: ulFixture(3)
      };
      keydown = window.Autocomplete.prototype.keydownListener.bind(thisArg);
    });

    describe('arrow key behaviour', function() {
      it('should select the first item from default state', function() { 
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(thisArg.ul, 0);
      });

      it('should not run off the end of the list', function() { 
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(thisArg.ul , 0);
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(thisArg.ul , 1);
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(thisArg.ul , 2);
        keydown({ keyCode: keys.DOWN });
        assertOptionSelected(thisArg.ul , 2);
      });

      it('should move up the list', function() {
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.UP });
        assertOptionSelected(thisArg.ul, 1);
      });

      it('should not move up in default state', function() {
        keydown({ keyCode: keys.UP });
        assertOptionSelected(thisArg.ul, -1);
      });

      it('should not run off the top of the list', function() {
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.UP });
        keydown({ keyCode: keys.UP });
        keydown({ keyCode: keys.UP });
        assertOptionSelected(thisArg.ul, -1);
      });
    });

    describe('tab key press', function () {
      
      var mockAutocomplete = window.Autocomplete.prototype;

      beforeEach(function() {
        createMock(mockAutocomplete);
      });

      afterEach(function() {
        mockAutocomplete.restore();
      });

      it('should prevent default if there are options', function(done) {
        mockAutocomplete.select = function() {};
        var thisArg = {
          ul: ulFixture(3)
        };
        
        mockAutocomplete.keydownListener.call(thisArg, {
          keyCode: keys.TAB, 
          preventDefault: done
        });
      });

      it('should not prevent default if there are no options', function(done) {
        mockAutocomplete.select = function() {};
        var thisArg = {
          ul: ulFixture(0)
        };

        mockAutocomplete.keydownListener.call(thisArg, { 
          keyCode: keys.TAB, 
          preventDefault: function() {
            done('should not be called');
          }
        });
        done();
      });

      it('should choose option in selected state', function(done) {
        mockAutocomplete.select = function(that, item) {
          item.innerHTML.should.equal('1');
          item.className.should.equal('selected');
          done();
        };

        var thisArg = {
          ul: ulFixture(3)
        };
        var keydown = mockAutocomplete.keydownListener.bind(thisArg);

        // it should default to select the first item in the options
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.TAB, preventDefault: function() {} });
      });

      it('should choose first option mid-typing', function(done) {
        mockAutocomplete.select = function(that, item) {
          item.innerHTML.should.equal('0');
          done();
        };

        var thisArg = {
          ul: ulFixture(3)
        };

        // it should default to select the first item in the options
        mockAutocomplete.keydownListener.call(thisArg, { 
          keyCode: keys.TAB, 
          preventDefault: function() {} 
        });
      });
    });

    describe('return key press', function() {
      
      var mockAutocomplete = window.Autocomplete.prototype;

      beforeEach(function() {
        createMock(mockAutocomplete);
      });

      afterEach(function() {
        mockAutocomplete.restore();
      });

      it('should prevent default if there are options', function(done) {
        mockAutocomplete.select = function() {};
        var thisArg = {
          ul: ulFixture(3)
        };
        
        mockAutocomplete.keydownListener.call(thisArg, { 
          keyCode: keys.RETURN, 
          preventDefault: done
        });
      });

      it('should not prevent default if there are no options', function(done) {
        mockAutocomplete.select = function() {};
        var thisArg = {
          ul: ulFixture(0)
        };
        
        mockAutocomplete.keydownListener.call(thisArg, { 
          keyCode: keys.RETURN, 
          preventDefault: function() {
            done('should not be called');
          }
        });
        done();
      });

      it('should choose option in selected state', function(done) {
        mockAutocomplete.select = function(that, item) {
          item.innerHTML.should.equal('0');
          done();
        };
        var thisArg = {
          ul: ulFixture(3)
        };
        var keydown = mockAutocomplete.keydownListener.bind(thisArg);

        // when the return key is pressed, it should default to select the
        // first item in the options
        keydown({ keyCode: keys.DOWN });
        keydown({ keyCode: keys.RETURN, preventDefault: function() {} });
      });
    });
  
  });

  describe('input event listener', function() {

    var mockJsonHttp = window.JsonHttp.prototype;
    var mockAutocomplete = window.Autocomplete.prototype;

    beforeEach(function() {
      createMock(mockAutocomplete);
      createMock(mockJsonHttp);
    });

    afterEach(function() {
      mockAutocomplete.restore();
      mockJsonHttp.restore();
    });

    it('should set placeholder to indicate server error', function() {
      mockJsonHttp.get = function(url, callback) {
        url.should.equal('http://localhost/s=foo');
        callback('error', null);
        thisArg.input.placeholder.should.equal('error fetching data...');
        thisArg.input.value.should.equal('');
      };

      var thisArg = {
        input: {
          value: 'foo'
        },
        placeholder : '',
        options: {
          url : 'http://localhost/s='
        },
        ul: ulFixture(0)
      };

      mockAutocomplete.inputListener.call(thisArg);
    });

    it('should display expected numer of items', function(done) {
      var thisArg = {
        input: {
          value: 'foo'
        },
        placeholder : '',
        options: {
          url :   'http://localhost/s=',
          label:  'title',
          value:  'id',
        },
        ul: ulFixture(0)
      };

      mockAutocomplete.select = function() {
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

        thisArg.ul.children.length.should.equal(2);
        thisArg.ul.children[0].innerHTML
          .should.equal('<span>0</span>Beverages');
        thisArg.ul.children[1].innerHTML
          .should.equal('<span>1</span>Condiments');

        var evt = document.createEvent('MouseEvent');
        evt.initEvent('click', true, false);
        thisArg.ul.children[1].dispatchEvent(evt);
      };

      mockAutocomplete.inputListener.call(thisArg);
    });

  });

});
