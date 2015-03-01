/**
 * A simple autocomplete for making ajax calls, sans jquery.
 *
 * @author Bradley Braithwaite https://github.com/bbraithwaite/boc-autocomplete
 * MIT license
 */

'use strict';

(function() {

  var _ = window.JsonHttp = function() {
    this.xhr = new XMLHttpRequest();
  };

  _.prototype.get = function(url, callback) {
    var xhr = this.xhr;
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          callback(null, this.response);
        } else {
          callback('error');
        }
      }
    };
    xhr.open('GET', url);
    xhr.responseType = 'json';  
    xhr.send();
  };

})();

(function() {

  var keys = {
    RETURN : 13,
    TAB : 9,
    DOWN : 40,
    UP : 38
  };

  var SELECTED_CLASS = 'selected';

  var _ = window.Autocomplete = function(input, opts) {
    
    var baseUrl = opts.url + '/?' + opts.param + '=';
    var ul = document.createElement('ul');
    ul.className = 'autocomplete';
    _.insertAfter(ul, input);
    input.autocomplete = 'off';
    input.className = 'autocomplete';
    this.opts = opts;
    this.input = input;
    this.ul = ul;
    input.addEventListener('input', this.inputListener(baseUrl, ul));
    input.addEventListener('keydown', this.keydownListener(ul));
    input.addEventListener('blur', this.blurListener(ul));
  };

  _.prototype.select = function(option) {
    var tokens = option.innerHTML.split(_.reOption);
    this.input.value = tokens[2];
    if (this.opts.select) {
      this.opts.select(tokens[1], tokens[2]);
    }
    _.removeChildren(this.ul);
  };

  _.prototype.inputListener = function(url, ul) {
    var jsonHttp = new window.JsonHttp();
    var opts = this.opts;
    return function() {
      var input = this;
      jsonHttp.get(url + encodeURIComponent(input.value), function(err, res) {
        _.removeChildren(ul);
        if (err) {
          input.placeholder = 'error fetching data...';
          input.value = '';
        } else {
          res.forEach(function(item) {
            var option = document.createElement('li');
            var valueSpan = document.createElement('span');
            valueSpan.innerHTML = item[opts.value];
            option.appendChild(valueSpan);
            option.appendChild(document.createTextNode(item[opts.label]));
            option.addEventListener('click', function() {
              _.prototype.select(this);
            });
            ul.appendChild(option);
          });
        }
      });
    };
  };

  _.prototype.keydownListener = function(ul) {
    var _ = this;
    return function(e) {
      var selected = ul.querySelector('.selected');
      if (e.keyCode === keys.DOWN) {
        if (selected) {
          if (selected.nextSibling) {
            selected.className = '';
            selected = selected.nextSibling;
            selected.className = SELECTED_CLASS;
          }
        } else {
          selected = ul.firstChild;
          selected.className = SELECTED_CLASS;
        }
      } else if (e.keyCode === keys.UP) {
        if (selected) {
          if (selected.previousSibling) {
            selected.className = '';
            selected = selected.previousSibling;
            selected.className = SELECTED_CLASS;
          } else {
            selected.className = '';
            selected = null;
          }
        }
      } else if (e.keyCode === keys.TAB && ul.firstChild) {
        e.preventDefault();

        if (selected) {
          // if nothing in the list is selected, pick the first option
          _.select(selected);
        } else {
          // specific selection with arrow keys
          _.select(ul.firstChild);
        }
        
      } else if (e.keyCode === keys.RETURN && ul.firstChild) {
        e.preventDefault();

        if (selected) {
          // specific selection with arrow keys
          _.select(selected);
        }
      }
    };
  };

  _.prototype.blurListener = function(ul) {
    return function() {
      if (ul.firstChild) {
        _.removeChildren(ul);
      }
    };
  };

  // Helpers
  _.reOption = /<span>(.*)<\/span>(.*)/;

  _.insertAfter = function(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  _.removeChildren = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };


})(window);