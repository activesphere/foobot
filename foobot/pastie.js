var util= require("util"),
    http = require('http'),
    qs = require('querystring'),
    path = require('path');
;

var pastieIt = function(text, isPrivate, callback) {
  var client = http.createClient(80, 'pastie.org');
  var payLoad = qs.stringify({"paste[authorization]":"burger", "paste[body]": text, "paste[restricted]": isPrivate ? 1 : 0, "paste[parser]": "plain_text"});
  console.log("" + payLoad);
  console.log("Content-Length:" + payLoad.length);
  var request = client.request('POST', '/pastes', {"Content-Type" : "application/x-www-form-urlencoded", "Content-Length" : payLoad.length, "Accept-Encoding": "identity", "Host" : "pastie.org"});
  console.log("Content-Type: " + request.getHeader("Content-Type"));
  request.on('response', function(response) {
    if(response.headers && response.headers.location) {
      callback(response.headers.location);
    }
    response.on('data', function(chunk) {
      console.log("body: " + chunk);
    });
      response.on('end', function() {
    });
  });

  request.write(payLoad);
  request.end();
}

var pastie = function(message) {
  pastieIt(message.text[0], true, function(url){
    console.log("Message:" + util.inspect(message));
    message.msg(url);
  });
};
module.exports=pastie
