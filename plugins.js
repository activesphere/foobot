var exec = require('child_process').exec, sys = require('sys'), util=require('util');
var redisLib = require('redis');
// var ReminderService = require('./foobot/reminder.js');

// var redis_client = redisLib.createClient();

var ifconfig = function(message) {
  exec("ifconfig", function(error, stdout, stderr) {
    message.say(stdout);
  });
};


// var reminderService = new ReminderService(redis_client);
// reminderService.on("due", function(reminder) {

// });
// var reminder = function(message) {
//   reminderService.add(message);
// };

var quit = function(message) {
  process.exit();
};


var Foobot = new (function(){
  var self = this;
  this.loadPlugins = function() {
    self._messageWatchers = [];
    self._messageWatchers.push({pattern: /^ifconfig$/i, callback: ifconfig});
    // self._messageWatchers.push({pattern: /^remind me/, callback: reminder});
    self._messageWatchers.push({pattern: /^quit$/i, callback: quit});
  };
  this.loadPlugins();
  this.plugins = {messageWatchers: this._messageWatchers};

})();

/*== Module Exports */
module.exports = Foobot.plugins
