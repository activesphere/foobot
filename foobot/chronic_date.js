var sys = require('sys');

var Chronic = new (function(){
  var minutes = function(date, offset) {
    date.setTime(date.getTime() + (offset*60*1000));
    return date;
  };

  var hours = function(date, offset) {
    date.setTime(date.getTime() + (offset*60*60*1000));
    return date;
  };

  var days = function(date, offset) {
    date.setTime(date.getTime() + (offset*24*60*60*1000));
    return date;
  };
  var formats = [{aliases: ["mins", "minutes"], callback: minutes}, {aliases: ["hours", "hrs"], callback: hours}, {aliases: ["days"], callback: days}];
  this.parse = function(str) {
    var timeStr = str.split("in ").pop();
    var date = new Date();
    formats.forEach(function(format) {
      format.aliases.forEach(function(alias) {
        var regex = new RegExp("(\\d+) " + alias);
        sys.puts("Checking for " + alias + " against " + timeStr + " using: " + regex);
        if((match = timeStr.match(regex))) {
          sys.puts("offset: "  + match[1]);
          format.callback(date, match[1]);
        }
      });
    });
    return date;
  };
})();
module.exports = Chronic.parse
