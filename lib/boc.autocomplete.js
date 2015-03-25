/**
 * A simple autocomplete for making ajax calls, sans jquery.
 *
 * @author Bradley Braithwaite https://github.com/bbraithwaite/boc-autocomplete
 * MIT license
 */

(function() {

  'use strict';

  var keys = {
    RETURN : 13,
    TAB : 9,
    DOWN : 40,
    UP : 38
  };

  var _ = window.Autocomplete = function(input, opts) {
  
    var ul = document.createElement('ul');
    ul.className = 'autocomplete';
    this.ul = ul;
  
    this.jsonHttp = new window.JsonHttp();  
    this.options = {
      url:    opts.url + '?' + opts.param + '=',
      label:  opts.label,
      select: opts.select
    };
  
    input.autocomplete = 'off';
    input.className = 'autocomplete';
    input.addEventListener('input', this.inputEvt.bind(this));
    input.addEventListener('keydown', this.keyEvt.bind(this));
    this.input = input;

    _.insertAfter(this.ul, this.input);
  };

  _.prototype = {
    select: function(that, option) {
      that.input.value = option.innerHTML;
      if (that.options.select) {
        that.options.select(JSON.parse(option.dataset.item));
      }
      _.clear(that.ul);
    },
    inputEvt: function() {
      if (this.input.value === '') {
        _.clear(this.ul);
        return;
      }
      var that = this;
      var url = that.options.url + encodeURIComponent(that.input.value);
      that.jsonHttp.get(url, function(err, res) {
        _.clear(that.ul);
        if (err) {
          that.input.placeholder = 'error fetching data...';
          that.input.value = '';
        } else {
          res.forEach(function(item) {
            var option = document.createElement('li');
            option.appendChild(
              document.createTextNode(item[that.options.label]));
            option.setAttribute('data-item', JSON.stringify(item));
            option.addEventListener('click', function() {
              that.select(that, this);
            });
            that.ul.appendChild(option);
          });
        }
      });
    },
    keyEvt: function(evt) {
      var selected;
      if (evt.keyCode === keys.DOWN) {
        _.keyDown(this.ul);
      } else if (evt.keyCode === keys.UP) {
        _.keyUp(this.ul);
      } else if (evt.keyCode === keys.TAB && this.ul.firstChild) {
        selected = this.ul.querySelector('.selected');
        evt.preventDefault();

        if (selected) {
          this.select(this, selected);
        } else {
          this.select(this, this.ul.firstChild);
        }
      } else if (evt.keyCode === keys.RETURN && this.ul.firstChild) {
        selected = this.ul.querySelector('.selected');
        evt.preventDefault();

        if (selected) {
          this.select(this, selected);
        }
      }
    } 
  };

  // private methods
  _.keyUp = function(ul) {
    var selected = ul.querySelector('.selected');
    if (selected) {
      if (selected.previousSibling) {
        selected.className = '';
        selected = selected.previousSibling;
        selected.className = _.CSS;
      } else {
        selected.className = '';
        selected = null;
      }
    }
  };

  _.keyDown = function(ul) {
    var selected = ul.querySelector('.selected');
    if (selected) {
      if (selected.nextSibling) {
        selected.className = '';
        selected = selected.nextSibling;
        selected.className = _.CSS;
      }
    } else {
      selected = ul.firstChild;
      selected.className = _.CSS;
    }
  };

  // Helpers
  _.CSS = 'selected';

  _.insertAfter = function(node, ref) {
    ref.parentNode.insertBefore(node, ref.nextSibling);
  };

  _.clear = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };

})(window);