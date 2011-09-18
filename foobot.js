var jerk = require( 'jerk' ), sys = require('sys'), redis = require("redis"), util = require('util');
var plugins = require('./foobot/plugins');

var EventEmitter = require('events').EventEmitter;
var User = require('./foobot/user.js');

var app = require('express').createServer();
var paginate = require("./paginate");

var settings = require('./foobot/settings.js')('./settings.json');

var redis_client = redis.createClient(settings.redis.port, settings.redis.host, settings.redis.options);
if(!!settings.redis.auth) {
  redis_client.auth(settings.redis.auth);
}

redis_client.on("error", function (err) {
  console.log("Error " + err);
});

var Activity = function(type){
  this.client = redis_client;
  this.type = type;
};

Activity.prototype.save = function(message) {
  var client = this.client;
  client.rpush('all.activities', JSON.stringify({type: this.type, args: message}))
};

var userLeave = function(user){
  redis_client.llen("all.activities", function(e, activityCount) {
    redis_client.hmset("user.leave." + user.nick, 'time', new Date().toString(), 'msgIndex', activityCount, function(e) { 
      new User(user.nick).offline(redis_client);
    });
  });
};

var userJoin = function(user) {
  var lastLeavingTime = redis_client.hmget("user.leave." + user.user.nick, 'time', 'msgIndex', function(err, replies) {
    redis_client.llen("all.activities", function(e, currActivityCount){
      var startIdx = replies[1];
      var endIdx = currActivityCount;
      sys.puts("Counts: " + replies[1] + " - " + currActivityCount );
      if (endIdx - startIdx > 20 ) {
        startIdx = endIdx - 20;
      }
      redis_client.lrange("all.activities", startIdx, endIdx, function(e, activities) {
        activities.forEach(function (act, i) {
          act = JSON.parse(act);
          if(act.type === "message") {
            user.say(act.args.user + ": " + act.args.text[0]);
          }
        });
      });
    });
  });
};


var Events = function(){
};

Events.prototype = new EventEmitter;
var events = new Events();

var bot = jerk( function( j ) {
  j.user_join(function(message) {
    userJoin(message);
    new Activity("join").save(message);
    events.emit("join", new User(message.user.nick));
  });

  j.user_leave(function(message) {
    userLeave(message.user);
    new Activity("leave").save(message);
  });

  plugins.messageWatchers.forEach(function(plugin) {
    j.watch_for(plugin.pattern, plugin.callback);
  });

  j.watch_for(/.*/, function(message) {
    new Activity("message").save(message);
  });
}).connect(settings.irc);

plugins.daemonPlugins.forEach(function(p){ 
  p.init(bot);
});

events.on("join", function(user) {
  user.joined(redis_client, bot);
});

app.helpers({paginationLinks: paginate.paginationLinks});

var renderMessages = function(req, res) {
  var start, end = paginate.rangeFor(req.query);
  redis_client.lrange('all.activities', start, end, function(e, messages) {
    res.render('index.jade', { title: 'My Site', messages: messages.reverse(), currentPage: req.query.page, layout:false});
  });
};

app.get('/', function(req, res){
  renderMessages(req, res);
});
app.listen(9999);
console.log("started web server on 9999");
 





