var sys = require('sys');
var settings = require('./settings.js')(__dirname+"/../settings.json");

var _users = settings.irc.admin_users

User = function(ircUser) {
  this.ircUser = ircUser;
};

User.prototype.user = function() {
  var user = [], self = this;
  _users.forEach(function(u){
    if(self.ircUser.indexOf(u) != -1) {
      user.push(u);
    }
  });
  return user.length == 1 ? user[0] : null;
};

User.prototype.offline = function(redis) {
  redis.hmset("user.join." + this.user(), "status", "off");
};
User.prototype.joined = function(redis, bot) {
  sys.log('User ' + this.user() + ' has joined');
  redis.hmset("user.join." + this.user(), 'time', new Date().toString(), 'status', 'on');
  this.sendInitMessages(redis, bot);
};

User.prototype.sendMessage = function(message, bot) {
  bot.bot.privmsg(this.ircUser, message, true);
};

User.prototype.notifyOnNextLogin = function(message, redis) {
  redis.rpush("user.join.messages." + this.user(), message);
};

User.prototype.notify = function(message, redis, bot) {
  var self = this;
  redis.hmget("user.join." + this.user(), "status", function(e, status) {
    if (status == "on") {
      self.sendMessage(message, bot);
    } else {
      self.notifyOnNextLogin(message, redis);
    }
  });
};

User.prototype.sendInitMessages = function(redis, bot) {
  var self = this;
  redis.lrange("user.join.messages." + this.user(), 0, -1, function(e, joinMessages) {
    joinMessages.forEach(function(message) {
      self.sendMessage(message, bot);
    });
    redis.del("user.join.messages." + self.user());
  });
};

module.exports = User
