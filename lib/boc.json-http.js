/**
 * A simple function for getting JSON via AJAX.
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