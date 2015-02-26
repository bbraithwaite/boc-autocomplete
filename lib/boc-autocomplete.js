/**
 * A simple autocomplete for making ajax calls, sans jquery.
 *
 * @author Bradley Braithwaite https://github.com/bbraithwaite/boc-autocomplete
 * MIT license
 */

'use strict';

window.boc = window.boc || {};
window.boc.autocomplete = window.boc.autocomplete || {};

(function() {

  var blurHandler = function(watermark) {
    return function() {
      if (this.value === '') {
        this.value = watermark;
      }
    };
  };

  var focusHandler = function(watermark) {
    return function() {
      if (this.value === watermark) {
        this.value = '';
      }
    };
  };

  var insertAfter = function(newNode, referenceNode) {
    
    if (referenceNode.nextSibling.nodeName === 'UL') {
      referenceNode.nextSibling.style.display = 'none';
    }

    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  var renderResults = function(input, server) {
    var ul = document.createElement('ul');
    server.response.forEach(function(item) {
      var li = document.createElement('li');
      li.innerHTML = item.title;    
      ul.appendChild(li);
    });

    insertAfter(ul, input);
  };

  var keyupHandler = function(opts) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    return function() {
      var _ = this;
      xhr.onload = function() {
        renderResults(_, this);
      };
      xhr.open('GET', opts.baseUrl + encodeURIComponent(_.value));
      xhr.send();
    };
  };

  window.boc.autocomplete.init = function(input, opts) {
    
    opts.watermark = input.value;
    opts.baseUrl = opts.url + '/?' + opts.param + '=';

    input.autocomplete = 'off';
    input.addEventListener('focus', focusHandler(opts.watermark));
    input.addEventListener('blur', blurHandler(opts.watermark));
    input.addEventListener('keyup', keyupHandler(opts));
  };

})();