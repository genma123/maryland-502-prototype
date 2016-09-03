var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var _ = require('lodash');

var app = express();
app.use(express.static(__dirname + "/public"));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
// app.use('/img',  express.static(__dirname + '/public/img'));
app.use(bodyParser.json());

app.use(function noCache(req, res, next) {
var dt = new Date(_.now());
console.log("in noCache, time: " + dt.toTimeString());
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires",0);
    next();
});
 
// Connect to the database before starting the application server. 
var connectString = process.env.MONGODB_URI || process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || "mongodb://localhost/mean-formlist";
console.log("connectString: " + connectString);
mongoose.connect(connectString, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("Database connection ready");
});

// Set up the persistence layer
app.use(require('./forms'));

// Avoid caching
app.use(function noCache(req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires",0);
  next();
});

// Launch the HTTP server
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

