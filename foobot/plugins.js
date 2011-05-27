var exec = require('child_process').exec, sys = require('sys'), util=require('util');
var redisLib = require('redis');
var ReminderService = require('./reminder.js'), ExpenseTracker = require('./expenses.js'), twitter = require('./twitter');
var pastie=require('./pastie.js'), gist=require('./gist.js');
var redis_client = redisLib.createClient();

redis_client.on("error", function (err) {
  console.log("Error " + err);
});

var ifconfig = function(message) {
  exec("ifconfig", function(error, stdout, stderr) {
    message.say(stdout);
  });
};


var reminderService = new ReminderService(redis_client);
reminderService.on("due", function(reminder) {
  sys.puts("a reminder is due: " + util.inspect(reminder));
  reminderService.due(reminder, redis_client);
});

var reminders = function(message) {
  if(reminderService != null) {
    reminderService.parse(message);
  }
};

// var expenseTracker = new ExpenseTracker(redis_client);
// var expense = function(message) {
//   if(expenseTracker != null) {
//     expenseTracker.parseExpense(message);
//   }
// };

var Foobot = new (function(){
  var self = this;
  this.loadPlugins = function() {
    self._messageWatchers = [];
    self._daemonPlugins = [];
    self._messageWatchers.push({pattern: /^ifconfig$/i, callback: ifconfig});
//    self._messageWatchers.push({pattern: /^expense:/, callback: expense});
    self._messageWatchers.push({pattern: /^remind:/, callback: reminders});
    self._messageWatchers.push({pattern: /^pastie:/, callback: pastie});
    self._messageWatchers.push({pattern: /^tweet:/, callback: twitter.tweet});
    self._messageWatchers.push({pattern: /^gist:/, callback: gist});
    self._daemonPlugins.push(reminderService);
    self._messageWatchers.push({pattern: /^quit$/i, callback: function(message) {
      process.quit();
    }});
  };
  this.loadPlugins();
  this.plugins = {messageWatchers: this._messageWatchers, daemonPlugins: this._daemonPlugins};

})();

/*== Module Exports */
module.exports = Foobot.plugins
