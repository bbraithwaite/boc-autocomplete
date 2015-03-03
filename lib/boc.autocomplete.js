/**
 * A simple autocomplete for making ajax calls, sans jquery.
 *
 * @author Bradley Braithwaite https://github.com/bbraithwaite/boc-autocomplete
 * MIT license
 */

(function() {

  'use strict';

  var _ = window.JsonHttp = function() {
    this.xhr = new XMLHttpRequest();
  };

  _.prototype = {
    get : function(url, callback) {
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
    }
  };

})();

(function() {

  'use strict';

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
      url:    opts.url + '?' + opts.param + '=',
      label:  opts.label,
      select: opts.select
    };
    this.jsonHttp = new window.JsonHttp();

    input.addEventListener('input', this.inputListener.bind(this));
    input.addEventListener('keydown', this.keydownListener.bind(this));

    _.insertAfter(this.ul, this.input);
  };

  _.prototype = {
    select: function(that, option) {
      that.input.value = option.innerHTML;
      if (that.options.select) {
        that.options.select(JSON.parse(option.dataset.item));
      }
      _.removeChildren(that.ul);
    },
    inputListener: function() {
      var that = this;
      var url = that.options.url + encodeURIComponent(that.input.value);
      that.jsonHttp.get(url, function(err, res) {
        _.removeChildren(that.ul);
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
    keydownListener: function(evt) {
      var selected;
      if (evt.keyCode === keys.DOWN) {
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
      } else if (evt.keyCode === keys.UP) {
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

  // Helpers
  _.SELECTED_CLASS = 'selected';

  _.insertAfter = function(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  _.removeChildren = function(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  };

})(window);