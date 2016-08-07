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
  var form = new Form(req.body);
  form.save(function (err, form) {
    if (err) { return next(err); }
    res.status(201).json(form);
  })
})

Form.find()
  .exec(function(err, forms) {
    if (err) { console.log("MONGOOSE FAILED"); }
    console.log("MONGOOSE READY");
});

module.exports = router;