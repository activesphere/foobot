var util= require("util"),
    https = require('https'),
    qs = require('querystring'),
    path = require('path');

var gistIt = function(text, isPrivate, callback) {
  var token = "06adce41a6236e5f249572662fc14474";
  var login = "foobot";

  var regex = /^gist:\s?((\w+)\.(\w+))?\s([\s\S]*)/;
  var matches = text.match(regex);
  if (!(matches && matches.length == 5)) {
    callback(null);
    return;
  }
  var fileName = matches[1], extension=matches[3], contents=matches[4];
  var payLoad = qs.stringify({"login" : login, "token" : token, "file_name[gistfile1]" : fileName, "action_button": "private", "file_ext[gistfile1]": extension, "file_contents[gistfile1]" : contents});
  var request = https.request({host: 'gist.github.com', port:443, method: 'POST', path: '/gists', headers: {"Content-Type" : "application/x-www-form-urlencoded", "Content-Length" : payLoad.length}});
  console.log("Content-Type: " + request.getHeader("Content-Type"));
  request.on('response', function(response) {
    if(response.headers && response.headers.location) {
      callback(response.headers.location);
    }
    response.on('data', function(chunk){
      console.log("" + chunk);
    });
    response.on('end', function() {
    });
    response.on('error', function(e){
      console.log("Error" + util.inspect(e));
    });
  });

  request.write(payLoad);
  request.end();
}

var gist = function(message) {
  gistIt(message.text[0], true, function(url){
    if(url == null) {
      message.say("Sorry, didn't understand the format");
    } else {
      message.say(url);
    }
  });
};

module.exports = gist
