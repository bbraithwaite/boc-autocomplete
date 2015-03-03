'use strict';

/*
 * Unit tests for lib/boc-autocomplete.js control keydown event.
 */

describe('boc.autocomplete.keydownEvent', function() {

  var ulFixture = function(liCount) {
    var ul = document.createElement('ul');
    for (var i = 0; i < liCount; i++) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(i));
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

  var searchInput;
 
  var keys = {
    RETURN : 13,
    TAB : 9,
    DOWN : 40,
    UP : 38
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

  describe('arrow key behaviour', function() {
    
    var keydown;
    var thisArg;

    beforeEach(function() {
      thisArg = {
        ul: ulFixture(3)
      };

      keydown = Autocomplete.prototype.keydownListener.bind(thisArg);
    });

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
    
    it('should prevent default if there are options', function(done) {

      var thisArg = {
        ul: ulFixture(3)
      };
      
      Autocomplete.prototype.keydownListener.call(thisArg, {
        keyCode: keys.TAB, 
        preventDefault: done
      });
    });

    it('should not prevent default if there are no options', function(done) {
      
      var thisArg = {
        ul: ulFixture(0)
      };

      Autocomplete.prototype.keydownListener.call(thisArg, { 
        keyCode: keys.TAB, 
        preventDefault: function() {
          done('should not be called');
        }
      });
      done();
    });

    it('should choose option in selected state', function(done) {
      
      var thisArg = {
        ul: ulFixture(3),
        select: function(that, option) {
          option.innerHTML.should.equal('1');
          option.className.should.equal('selected');
          done();
        }
      };

      var keydown = Autocomplete.prototype.keydownListener.bind(thisArg);

      // it should default to select the first item in the options
      keydown({ keyCode: keys.DOWN });
      keydown({ keyCode: keys.DOWN });
      keydown({ keyCode: keys.TAB, preventDefault: function() {} });
    });

    it('should choose first option mid-typing', function(done) {
      var thisArg = {
        ul: ulFixture(3),
        select: function(that, item) {
          item.innerHTML.should.equal('0');
          done();
        }
      };

      // it should default to select the first item in the options
      Autocomplete.prototype.keydownListener.call(thisArg, { 
        keyCode: keys.TAB, 
        preventDefault: function() {} 
      });
    });
  });

  describe('return key press', function() {

    it('should prevent default if there are options', function(done) {
      var thisArg = {
        ul: ulFixture(3)
      };
      
      Autocomplete.prototype.keydownListener.call(thisArg, { 
        keyCode: keys.RETURN, 
        preventDefault: done
      });
    });

    it('should not prevent default if there are no options', function(done) {
      var thisArg = {
        ul: ulFixture(0)
      };
      
      Autocomplete.prototype.keydownListener.call(thisArg, { 
        keyCode: keys.RETURN, 
        preventDefault: function() {
          done('should not be called');
        }
      });
      done();
    });

    it('should choose option in selected state', function(done) {
      var thisArg = {
        ul: ulFixture(3),
        select: function(that, option) {
          option.innerHTML.should.equal('0');
          done();
        }
      };
      var keydown = Autocomplete.prototype.keydownListener.bind(thisArg);

      // when the return key is pressed, it should default to select the
      // first item in the options
      keydown({ keyCode: keys.DOWN });
      keydown({ keyCode: keys.RETURN, preventDefault: function() {} });
    });
  });

});