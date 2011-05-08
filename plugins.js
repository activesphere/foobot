var exec = require('child_process').exec;

var ifconfig = function(message) {
  exec("ifconfig", function(error, stdout, stderr) {
    message.say(stdout);
  });
};

var quit = function(message) {
  process.exit();
};


var Foobot = new (function(){
  var self = this;
  this.loadPlugins = function() {
    self._messageWatchers = [];
    self._messageWatchers.push({pattern: /^ifconfig$/, callback: ifconfig});
    self._messageWatchers.push({pattern: /^quit$/, callback: quit});
  };
  this.loadPlugins();
  this.plugins = {messageWatchers: this._messageWatchers};

})();

/*== Module Exports */
module.exports = Foobot.plugins
