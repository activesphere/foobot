var redis = require("redis"),
client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

var foo = client.lpop("foobar", function(e, val){console.log("val:" + val);
                                         });
console.log("Foo: " + foo);
// client.rpush("foobar", "b");

