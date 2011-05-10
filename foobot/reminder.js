var EventEmitter = require('events').EventEmitter;
var sys = require('sys');

var ReminderService = function(redis) {
  this.redis = redis;
  this.reminders = [];
  this.interval = 5;
  updateReminders(this.redis, this, this.interval);
};

ReminderService.prototype = new EventEmitter

ReminderService.prototype.add = function(remind) {
  this.redis.rpush("all.reminders", JSON.stringify(remind));
};

var getReminders = function(redis, callback) {
  redis.lrange("all.reminders", 0, -1, callback);
};

var updateReminders = function(redis, notifier, interval) {
  var handleReminders = function(err, reminders) {
    var expired = [];
    reminders.forEach(function(reminder, idx) {
      var reminder = JSON.parse(reminder);
      if(reminder.expired) {
        return;
      }
      if (reminder.when - interval <=0 ) {
        sys.puts("expired");
        reminder.when = -1;
        reminder.expired = true;
        expired.push(idx);
        notifier.emit('due', reminder);
      } else {
        reminder.when = reminder.when - interval;
      }
    });
    expired.forEach(function(e) {
      redis.ltrim("all.reminders", e, e);
    });
  };

  getReminders(redis, handleReminders);
  setTimeout(updateReminders, interval*1000, redis, notifier, interval);
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

