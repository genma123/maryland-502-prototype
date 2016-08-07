'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Form Schema
 */
var Form = new Schema({
	totalTax: String,
	adjustedGrossIncome: String,
	wagesSalariesAndOrTips:  String,
	filingStatus: { status: String, code: Number },
	subdivision: { locality: String, rate: Number },
	earnedIncome: String,
	yourself: Boolean,
	you65orOver: Boolean,
	youBlind: Boolean,
	spouseSelf: Boolean,
	spouse65orOver: Boolean,
	spouseBlind: Boolean,
	numberOfDependents: Number,
	numberOfDependentsOver65: Number,
	totalRegularExemptions: Number,
	totalSpecialExemptions: Number,
	standardDeduction: Number,
	exemptionAmount: Number,
	minimumFilingIncome: Number,
	netTaxableIncome: Number,
	bracketRate: Number,
	marylandTax: Number,
	localTax: Number,
	formId: String
});

mongoose.model('Form', Form);