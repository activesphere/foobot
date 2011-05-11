var EventEmitter = require('events').EventEmitter;
var sys = require('sys'), util = require('util');

var ReminderService = function(redis) {
  this.redis = redis;
  this.reminders = [];
  this.interval = 10;
  setInterval(updateReminders, this.interval*1000, this.redis, this, this.interval);
  this.addTestCases();
};

ReminderService.prototype = new EventEmitter

ReminderService.prototype.addTestCases = function(){
  this.add({when: 60, about: "2.1st thing to do is this", who: "harsu"});
  this.add({when: 30, about: "first thing to do is this", who: "harsu"});
  this.add({when: 90, about: "3rd thing to do is this", who: "harsu"});
  this.add({when: 58, about: "2.0th thing to do is this", who: "harsu"});
  this.add({when: 120, about: "last thing to do is this", who: "harsu"});
};

ReminderService.prototype.add = function(remind) {
  this.redis.sadd("all.reminders", JSON.stringify(remind));
};

ReminderService.prototype.init = function(bot) {
  this.bot = bot;
};

ReminderService.prototype.due = function(reminder) {
  if (this.bot != null) {
    this.bot.bot.privmsg(reminder.who, reminder.about, true);
  }
};

var getReminders = function(redis, callback) {
  redis.smembers("all.reminders", callback);
};

var copy = function(reminder) {
  return {when: reminder.when, about: reminder.about, who: reminder.who};
};


var updateReminders = function(redis, notifier, interval) {
  var handleReminders = function(err, reminders) {
    var expired = [], updated=[];
    reminders.forEach(function(reminder, idx) {
      var reminder = JSON.parse(reminder);
      if (reminder.when - interval <= 0) {
        sys.puts("expired");
        expired.push(reminder);
        notifier.emit('due', reminder);
      } else {
        var oldReminder = copy(reminder);
        reminder.when = reminder.when - interval;
        updated.push({old: oldReminder, neww: reminder});
      }
    });
    expired.forEach(function(e) {
      sys.puts("removing: " + JSON.stringify(e));
      redis.srem("all.reminders", JSON.stringify(e), function(err) {});
    });
    updated.forEach(function(obj) {
      redis.srem("all.reminders", JSON.stringify(obj.old), function(e) {
        redis.sadd("all.reminders", JSON.stringify(obj.neww));
      });
    });
  };
  getReminders(redis, handleReminders);
};

// ReminderService.prototype.poll = function() {
//   var self = this;
// };

// var cal = new ReminderService();
// cal.on('due', function(reminder) {
//   sys.puts(reminder.about + " is due now");
// });

// cal.add({when: 10, about: "first thing to do is this"});
// cal.add({when: 18, about: "3rd thing to do is this"});
// cal.add({when: 13, about: "2nd thing to do is this"});
// cal.add({when: 22, about: "last thing to do is this"});
module.exports = ReminderService

