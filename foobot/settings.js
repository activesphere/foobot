(function() {
  var Settings, exports, fs, sys;
  sys = require('sys');
  fs = require('fs');
  Settings = exports = module.exports = function(file) {
    return JSON.parse(fs.readFileSync(file));
  };
}).call(this);
