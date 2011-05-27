var sys=require("sys"), util=require("util"), http=require("http"), qs=require("querystring");

var apiKey = "R_d94249c2e7ae2fa680b49a723458ce59";
var login="foobot";
var path = function(url) {
  var params = qs.stringify({login: login, apiKey: apiKey, longUrl: url, format: 'json'});
  return '/v3/shorten?' + params;
};

var shorten = function(url, cb) {
  console.log("Url to shorten: " + url);
  var request = http.request({host: 'api.bitly.com', method: 'GET', path: path(url)});
  request.on('response', function(response) {
    var responseBody = "";
    if(response.headers && response.headers.location) {
      callback(response.headers.location);
    }
    response.on('data', function(chunk){
      responseBody += chunk;
    });
    response.on('end', function() {
      if (cb) {
        cb(JSON.parse(responseBody).data.url);
      }
    });
    response.on('error', function(e){
      console.log("Error" + util.inspect(e));
    });
  });

  request.end();
};

module.exports=shorten;
