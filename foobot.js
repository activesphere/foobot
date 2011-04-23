var jerk = require( 'jerk' ), sys=require('sys'), redis = require("redis");

var redis_client = redis.createClient();
redis_client.on("error", function (err) {
  console.log("Error " + err);
});

var Message = function(){
  sys.puts('Redis client: ' + (redis_client == null));
  this.client = redis_client;
};

Message.prototype.save = function(message) {
  var client = this.client;
  this.client.incr("MessageId", function(err, reply){
    sys.log("Message id is: " + reply);
    client.hmset(reply, "user", message.user, "match_data", message.match_data, "source", message.source, "text", message.text);
  });
};

var options =
  { server: 'irc.foonetic.net'
  , nick: 'FoobotPlusPlus'
  , channels: [ '#foobot' ]
  };

var logger = new Message();
jerk( function( j ) {
  j.watch_for( /^Good joke nila$/i, function( message ) {
    sys.puts("Message from: " + message.user);
    message.say("nila: That's a horrible joke. Get back to work!" )
  });

  j.watch_for(//,);
  j.watch_for(/history/i, function(message) {
  });
  j.watch_for(/.*/, function(message){
    logger.save(message);
  });
}).connect(options);



