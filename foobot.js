var jerk = require( 'jerk' ), sys=require('sys'), redis = require("redis"), util=require('util');

var redis_client = redis.createClient();
redis_client.on("error", function (err) {
  console.log("Error " + err);
});

var Activity = function(type){
  this.client = redis_client;
  this.type = type;
  sys.puts('Redis client: ' + (redis_client == null));
};

Activity.prototype.save = function(message) {
  var client = this.client;
  client.rpush('all.activities', JSON.stringify({type: this.type, args: message}))
};

var userLeave = function(user){
  redis_client.llen("all.activities", function(e, activityCount) {
    redis_client.hmset("user.leave." + user.nick, 'time', new Date().toString(), 'msgIndex', activityCount);
  });
};

var userJoin = function(user) {
  var lastLeavingTime = redis_client.hmget("user.leave." + user.user.nick, 'time', 'msgIndex', function(err, replies) {
    redis_client.llen("all.activities", function(e, currActivityCount){
      sys.puts("Counts: " + replies[1] + " - " + currActivityCount );
      redis_client.lrange("all.activities", replies[1], currActivityCount, function(e, activities) {
        if(activities.length > 0) {
          user.say("You missed these messages");
        }
        activities.forEach(function (act, i) {
          act = JSON.parse(act);
          sys.puts("Act(" + i + "): " + act);
          sys.puts(act.type + " >> " + act["type"]);
          if(act.type == "message") {
            user.say(act.args.text[0]);
          }
        });
      });
    });
  });
};


var options =
  { server: 'vervet.foonetic.net'
  , nick: 'FoobotPlusPlus'
  , channels: [ '#foobot' ]
  };

jerk( function( j ) {
  j.watch_for( /^Good joke nila$/i, function( message ) {
    sys.puts("Message from: " + message.user);
    message.say("nila: That's a horrible joke. Get back to work!" )
  });

  j.user_join(function(message) {
    userJoin(message);
    new Activity("join").save(message);
  });

  j.user_leave(function(message) {
    userLeave(message.user);
    new Activity("leave").save(message);
  });
  j.watch_for(/.*/, function(message){
    new Activity("message").save(message);
  });
}).connect(options);
