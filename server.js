var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var FORMS_COLLECTION = "forms";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
// app.use('/img',  express.static(__dirname + '/public/img'));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost/mean-formlist", function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Avoid caching
  app.use(function noCache(req, res, next) {
// console.log("in noCache");
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires",0);
    next();
  });

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// FORMS API ROUTES BELOW

// TODO use Mongoose

// TODO split into routes/controller

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/forms"
 *    GET: finds all forms
 *    POST: creates a new form
 */

app.get("/forms", function(req, res) {
  db.collection(FORMS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get forms.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/forms", function(req, res) {
  var newForm = req.body;
  newForm.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(FORMS_COLLECTION).insertOne(newForm, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new form.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/forms/:id"
 *    GET: find form by id
 *    PUT: update form by id
 *    DELETE: deletes form by id
 */

app.get("/forms/:id", function(req, res) {
  db.collection(FORMS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get form");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/forms/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(FORMS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update form");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/forms/:id", function(req, res) {
  db.collection(FORMS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete form");
    } else {
      res.status(204).end();
    }
  });
});