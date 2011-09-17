var sys = require('sys');

var Twitter = require('evented-twitter').Twitter;
// var creds = JSON.parse(fs.readFileSync('./foobot/creds.json')) 
var settings = require(__dirname+'/../foobot/settings.js')('./settings.json');

var oauth = settings.twitter.oauth;
var shorten = require("./shorten_url.js");

console.log(sys.inspect(oauth));

var t = new Twitter(oauth);

var tweet = function(message) {
  var tweetText = message.text[0].match(/^tweet:(.*)/)[1];
  if (tweetText.indexOf("http") != -1) {
    var longUrl = tweetText.match(/(http\S+)/)[1];
    var merge = function(shortUrl) {
      console.log("Long url: " + longUrl);
      console.log("Short url: " + shortUrl);
      postToTwitter(message, tweetText.replace(longUrl, shortUrl));
    };
    shorten(longUrl, merge);
  } else {
    postToTwitter(message, tweetText);
  }
};

var postToTwitter = function(message, tweetText) {  
  console.log("Posting to twitter: " + tweetText);
  t.update('json', { status: tweetText }, function(err, data, res) {
    if(err) {
      message.say("Error in tweeting: " + util.inspect(err));
    } else {
      console.log("Response: " + data);
      message.say("http://twitter.com/#!/foobotfoo/status/" + JSON.parse(data).id_str);
    }
    console.log(data);
    //    var data = JSON.parse(data);
    
  });

};


module.exports = {tweet: tweet};
