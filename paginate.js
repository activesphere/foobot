var helpers = require('express-helpers'), 
    urllib = require('url'), 
    qs = require("querystring"), 
    sys = require("sys"), 
    util = require("util");

var urlFor = function(url, params) {
  if (!url.query) {
    url.query = {};
  }
  url.query = params;
  return urllib.format(url);
};

var paginationLinks = function(link, collection, currentPage) {
  var url = urllib.parse(link);
  currentPage = (currentPage == null) ? 0 : currentPage;
  currentPage = parseInt(currentPage);
  var perPage = 100;
  var totalPages = parseInt(collection.length/perPage + 1);
  sys.log("Total page: " + totalPages);

  if (totalPages == 1) {
    return "";
  }
  var links = "", query= url.query ? url.query : {};

  if (currentPage != 0) {
    query.page = null;
    links += "<a href=" + urlFor(url, query) + ">First</a> &nbsp; &nbsp;";

    query.page = currentPage - 1;
    links += "<a href=" + urlFor(url, query) + ">Previous</a>";
  }

  if(currentPage < totalPages) {
    query.page = currentPage + 1;
    links += "<a href=" + urlFor(url, query) + ">Next</a>&nbsp;&nbsp;";

    query.page = totalPages;
    links += "<a href=" + urlFor(url, query) + ">Last</a>";
  }

  return links;
};

var rangeFor = function(params) {
  var page = (params.page == null) ?  0 : params.page;
  var perPage = 10;
  var start = page*perPage;
  var end = (page + 1)*perPage - 1;
  return start, end;
};

exports.paginationLinks = paginationLinks;
exports.rangeFor = rangeFor;

