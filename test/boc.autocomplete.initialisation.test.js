'use strict';

/*
 * Unit tests for lib/boc-autocomplete.js control initialisation.
 */

describe('boc.autocomplete.initialisation', function() {

  var searchInput;

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
      new window.Autocomplete(searchInput, {});
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
    
    beforeEach(function() {
      testUtils.createMock(Autocomplete.prototype);
    });

    afterEach(function() {
      Autocomplete.prototype.restore();
    });

    it('should listen to input event', function (done) {
      Autocomplete.prototype.inputEvt = function() {
        done();
      };
      new window.Autocomplete(searchInput, {});
      searchInput.dispatchEvent(testUtils.getKeyboardEvent('input'));
    });

    it('should listen to keydown event', function (done) {
      Autocomplete.prototype.keyEvt = function() {
        done();
      };
      new window.Autocomplete(searchInput, {});
      searchInput.dispatchEvent(testUtils.getKeyboardEvent('keydown'));
    });

  });

});
