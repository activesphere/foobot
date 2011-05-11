var redis = require("redis"),
client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

client.sadd("foobar", JSON.stringify({a: "1", b: 2, c: "foo"}), function(err){client.sadd("foobar", JSON.stringify({a: "1", b: 3, c: "foo"}));});

client.srem("foobar", JSON.stringify({a: "1", b: 2, c: "foo"}), function(e){client.srem("foobar", JSON.stringify({a: "1", b: 3, c: "foo"}));
                                                                    });


