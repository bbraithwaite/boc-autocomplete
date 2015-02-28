/**
 * A simple autocomplete for making ajax calls, sans jquery.
 *
 * @author Bradley Braithwaite https://github.com/bbraithwaite/boc-autocomplete
 * MIT license
 */

'use strict';

(function(w) {

  w.boc = w.boc || {};
  w.boc.autocomplete = w.boc.autocomplete || {};
  var $ = $ || {};

  var keys = {
    RETURN : 13,
    TAB : 9,
    DOWN : 40,
    UP : 38
  };

  $.reOption = /<span>(.*)<\/span>(.*)/;

  $.insertAfter = function(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  $.removeChildren = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };

  w.boc.autocomplete.init = function(input, opts) {

    var cache = {};
    var liSelected;
    var baseUrl = opts.url + '/?' + opts.param + '=';

    var _clear = function(el) {
      $.removeChildren(el);
      liSelected = null;
    };

    var _select = function(option, input, opts) {
      var tokens = option.innerHTML.split($.reOption);
      input.value = tokens[2];
      if (opts.select) {
        opts.select(tokens[1], tokens[2]);
      }
    };

    var _renderResults = function(input, ul, server, opts) {
      server.response.forEach(function(item) {
        var option = document.createElement('li');
        var valueSpan = document.createElement('span');
        valueSpan.innerHTML = item[opts.value];
        option.appendChild(valueSpan);
        option.appendChild(document.createTextNode(item[opts.label]));
        option.addEventListener('click', function() {
          _clear(ul);
          _select(this, input, opts);
        });
        ul.appendChild(option);
      });
    };
    
    var _inputHandler = function(ul, opts) {
      return function() {
        _clear(ul);
        var xhr = new XMLHttpRequest();  
        xhr.responseType = 'json';
        var _ = this;
       
        xhr.onload = function() {
          cache[_.value] = this.response;
          _renderResults(_, ul, this, opts);
        };
        xhr.onerror = function() {
          // TODO
        };
        xhr.open('GET', baseUrl + encodeURIComponent(_.value));
        xhr.send();
      };
    };

    var _handleKeySelect = function(ul, input, opts) {
      var menuSelection = ul.querySelector('.selected');

      if (menuSelection) {
        _select(menuSelection, input, opts);
      } else {
        var cached = cache[input.value][0];
        input.value = cached[opts.label];
        if (opts.select) {
          opts.select(cached[opts.value], cached[opts.label]);
        }
      }

      _clear(ul);
    };

    var _keydown = function() {
      
      if (event.which === keys.TAB && ul.firstChild) {
        event.preventDefault();
        _handleKeySelect(ul, input, opts);
      } else if (event.which === keys.RETURN && ul.firstChild) {
        _handleKeySelect(ul, input, opts);
      } else if (event.which === keys.DOWN) {

        if (liSelected) {
          if (liSelected.nextSibling) {
            liSelected.className = '';
            liSelected = liSelected.nextSibling;
            liSelected.className = 'selected';
          }
        } else {
          liSelected = ul.firstChild;
          liSelected.className = 'selected';
        }

      } else if (event.which === keys.UP) {
        
        if (liSelected) {
          if (liSelected.previousSibling) {
            liSelected.className = '';
            liSelected = liSelected.previousSibling;
            liSelected.className = 'selected';
          } else {
            liSelected.className = '';
            liSelected = null;
          }
        }
      }

    };

    var _blur = function() {
      if (ul.firstChild) {
        _clear(ul);
      }
    };

    var ul = document.createElement('ul');
    ul.className = 'autocomplete';
    $.insertAfter(ul, input);
    input.autocomplete = 'off';
    input.className = 'autocomplete';
    input.addEventListener('input', _inputHandler(ul, opts));
    input.addEventListener('keydown', _keydown);
    input.addEventListener('blur', _blur);
  };

})(window);