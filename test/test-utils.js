(function() {

  'use strict';

  var util = window.testUtils || {};

  util.getKeyboardEvent = function(type) {
    var evt = document.createEvent('KeyboardEvent');
    evt.initEvent(type, true, false);
    return evt;
  };

  window.testUtils = util;
  
}());

(function() {

  'use strict';

  var util = window.testUtils || {};

  // utility function to restore overridable funcs on prototype
  util.createMock = function(obj) {

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

  window.testUtils = util;

}());