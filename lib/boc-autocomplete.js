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

  var _ = window.Autocomplete = function(input, opts) {
    this.input = input;
    this.input.autocomplete = 'off';
    this.input.className = 'autocomplete';
    this.ul = document.createElement('ul');
    this.ul.className = 'autocomplete';
    this.options = {
      url:    opts.url + '/?' + opts.param + '=',
      label:  opts.label,
      value:  opts.value,
      select: opts.select
    };

    input.addEventListener('input', _.prototype.inputListener.bind(this));
    input.addEventListener('keydown', _.prototype.keydownListener.bind(this));
    input.addEventListener('blur', _.prototype.blurListener.bind(this));

    _.insertAfter(this.ul, this.input);
  };

  _.prototype.select = function(that, option) {
    console.log(that);
    var tokens = option.innerHTML.split(_.OPTION_REG_EX);
    that.input.value = tokens[2];
    if (that.options.select) {
      that.options.select(tokens[1], tokens[2]);
    }
    _.removeChildren(that.ul);
  };

  _.prototype.inputListener = function() {
    var me = this;
    var jsonHttp = new window.JsonHttp();
    jsonHttp.get(me.options.url + encodeURIComponent(me.input.value), function(err, res) {
      _.removeChildren(me.ul);
      if (err) {
        me.input.placeholder = 'error fetching data...';
        me.input.value = '';
      } else {
        res.forEach(function(item) {
          var option = document.createElement('li');
          var valueSpan = document.createElement('span');
          valueSpan.innerHTML = item[me.options.value];
          option.appendChild(valueSpan);
          option.appendChild(document.createTextNode(item[me.options.label]));
          option.addEventListener('click', function() {
            _.prototype.select(me, this);
          });
          me.ul.appendChild(option);
        });
      }
    });
  };

  _.prototype.keydownListener = function(e) {
    var selected;
    if (e.keyCode === keys.DOWN) {
      selected = this.ul.querySelector('.selected');
      if (selected) {
        if (selected.nextSibling) {
          selected.className = '';
          selected = selected.nextSibling;
          selected.className = _.SELECTED_CLASS;
        }
      } else {
        selected = this.ul.firstChild;
        selected.className = _.SELECTED_CLASS;
      }
    } else if (e.keyCode === keys.UP) {
      selected = this.ul.querySelector('.selected');
      if (selected) {
        if (selected.previousSibling) {
          selected.className = '';
          selected = selected.previousSibling;
          selected.className = _.SELECTED_CLASS;
        } else {
          selected.className = '';
          selected = null;
        }
      }
    } else if (e.keyCode === keys.TAB && this.ul.firstChild) {
      selected = this.ul.querySelector('.selected');
      e.preventDefault();

      if (selected) {
        // if nothing in the list is selected, pick the first option
        _.prototype.select(this, selected);
      } else {
        // specific selection with arrow keys
        _.prototype.select(this, this.ul.firstChild);
      }
      
    } else if (e.keyCode === keys.RETURN && this.ul.firstChild) {
      selected = this.ul.querySelector('.selected');
      e.preventDefault();

      if (selected) {
        // specific selection with arrow keys
        _.prototype.select(this, selected);
      }
    }
  };

  _.prototype.blurListener = function() {
    if (this.ul.firstChild) {
      _.removeChildren(this.ul);
    }
  };

  // Helpers
  _.SELECTED_CLASS = 'selected';

  _.OPTION_REG_EX = /<span>(.*)<\/span>(.*)/;

  _.insertAfter = function(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  _.removeChildren = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };

})(window);