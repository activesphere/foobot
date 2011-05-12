var EventEmitter = require('events').EventEmitter;
var sys = require('sys'), util = require('util'), parser=require('./chronic_date.js'), User = require('./user.js');

var ReminderService = function(redis) {
  this.redis = redis;
  this.reminders = [];
  this.interval = 10;
  setInterval(updateReminders, this.interval*1000, this.redis, this, this.interval);
  this.addTestCases();
};

ReminderService.prototype = new EventEmitter

ReminderService.prototype.addTestCases = function(){
  // var in = function(n){ var dt= new Date(); dt.getTime() + (n*60*1000); return dt;};
  // this.add({when: in(60), about: "2.1st thing to do is this", who: "harsu"});
  // this.add({when: in(30), about: "first thing to do is this", who: "harsu"});
  // this.add({when: in(90), about: "3rd thing to do is this", who: "harsu"});
  // this.add({when: in(58), about: "2.0th thing to do is this", who: "harsu"});
  // this.add({when: in(120), about: "last thing to do is this", who: "harsu"});
};

ReminderService.prototype.add = function(remind) {
  this.redis.sadd("all.reminders", JSON.stringify(remind));
};

ReminderService.prototype.parse = function(message) {  
  var text = message.text[0];
  var matches = text.match(/remind:\s?((\w+)\s+about\s+)?((\w+\s?)+)in\s+(.*)/)
  var reminder;
  if (matches && matches.length == 6) {
    var who = matches[2] == null ? message.user : matches[2];
    reminder = {about: matches[3], when: parser(matches[5]), who: who};
    sys.log("Reminder: " + util.inspect(reminder));
    this.add(reminder);
  } else {
    message.say("Sorry, didn't understand that");
  }
};

ReminderService.prototype.init = function(bot) {
  this.bot = bot;
};

ReminderService.prototype.due = function(reminder, redis) {
  if (this.bot != null) {
    var user = new User(reminder.who);
    user.notify(reminder.about, redis, this.bot);
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
    var expired = [];
    reminders.forEach(function(reminder, idx) {
      var reminder = JSON.parse(reminder);
      sys.puts("Reminder expires: " + Date.parse(reminder.when) + ">> " + Date.parse(new Date()) + "::" + Date.parse(reminder.when) < Date.parse(new Date()));
      if (Date.parse(reminder.when) < Date.parse(new Date())) {
        sys.puts("expired");
        expired.push(reminder);
        notifier.emit('due', reminder, redis);
      }
    });
    expired.forEach(function(e) {
      sys.puts("removing: " + JSON.stringify(e));
      redis.srem("all.reminders", JSON.stringify(e), function(err) {});
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

