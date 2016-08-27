var router = require('express').Router();
var mongoose = require('mongoose');
require('./model');
var Form = mongoose.model('Form');
var _ = require('lodash');

router.get('/api/forms', function (req, res, next) {
console.log("in GET");
	var query = {};
	console.log("request query: " + _.map(req.query));
	if (req.query.formIdentifier) {
		query = { formId: req.query.formIdentifier };
		console.log("query: " + _.map(query));
	}

  Form.find(query)
  .exec(function(err, forms) {
	  console.log("forms: " + _.map(forms));
    if (err) { return next(err); }
    res.status(200).json(forms);
  });
});

router.get('/api/forms/:formId', function (req, res, next) {
console.log("in GET by ID");
  /*
  if (!mongoose.Types.ObjectId.isValid(req.params.formId)) {
    return res.status(400).send({
      message: 'Form is invalid'
    });
  } */
  Form.findById(req.params.formId)
    .exec(function(err, form) {
	  // console.log("err: " + err);
    if (err) { return next(err); }
    res.status(200).json(form);
  });
});

router.post('/api/forms', function (req, res, next) {
console.log("in POST");

  var query = {};
  console.log("request body: " + _.map(req.body));
  if (req.body.formIdentifier) {
	  query = { formId: req.body.formIdentifier };
	  console.log("query: " + _.map(query));
  }

  Form.find(query)
  .exec(function(err, forms) {
	  // console.log("forms: " + _.map(forms));
    if (err) { return next(err); }
	if (forms.length) {
		console.log("updating form NOW:\n");
			console.log(req.body);
			// _.extend(profile , req.body);
		// forms[0].save(function(err,form) {
		Form.findByIdAndUpdate(forms[0]._id,
				req.body,
				{ upsert: true, new: true },
				function(err,form) {
					if (err) { return next(err); }
					console.log(form);
					res.status(200).json(form);
				}
		);
	} else {
	  console.log("creating form");
	  var form = new Form(req.body);
	  form.save(function (err, form) {
		if (err) { return next(err); }
		console.log(form);
		res.status(201).json(form);
	  });
	}
  });

})

Form.find()
  .exec(function(err, forms) {
    if (err) { console.log("MONGOOSE FAILED"); }
    console.log("MONGOOSE READY");
});

module.exports = router;