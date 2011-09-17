var app = require('express').createServer();
var redis = require("redis"), util = require('util'), sys=require('sys');
var paginate = require("./paginate");
var Settings = require('./settings');

app.configure(function(){
  app.set('views', __dirname + '/views');
});

app.helpers({paginationLinks: paginate.paginationLinks});

var redis_client = redis.createClient();
redis_client.on("error", function (err) {
  console.log("Error " + err);
});

var renderMessages = function(req, res) {
  var start, end = paginate.rangeFor(req.query);
  redis_client.lrange('all.activities', start, end, function(e, messages) {
    sys.log("Messages: " + util.inspect(messages));
    res.render('index.jade', { title: 'My Site', messages: messages.reverse(), currentPage: req.query.page, layout:false});
  });
};

app.get('/', function(req, res){
  renderMessages(req, res);
});

app.listen(3000);
 
