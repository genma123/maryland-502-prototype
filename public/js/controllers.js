angular.module("marylandTaxApp")
	.controller("MarylandTaxController", ['$scope', '$cookies', '$location', '$routeParams', '$rootScope', 'ngDialog', 'Maryland502',
		function($scope, $cookies, $location, $routeParams, $rootScope, ngDialog, Maryland502) {
        /* Maryland502.getMaryland502($routeParams.contactId).then(function(doc) {
            $scope.form = doc.data;
        }, function(response) {
            alert(response); NO BACK END FOR NOW */
        /* }); */
		
		$scope.subdivisionChoices = [{locality: "Baltimore City", rate: 0.0320},
									{locality: "Allegany County", rate: 0.0305},
									{locality: "Anne Arundel County", rate: 0.0256},
									{locality: "Baltimore County", rate: 0.0283},
									{locality: "Calvert County", rate: 0.0280},
									{locality: "Caroline County", rate: 0.0273},
									{locality: "Carroll County", rate: 0.0303},
									{locality: "Cecil County", rate: 0.0280},
									{locality: "Charles County", rate: 0.0303},
									{locality: "Dorchester County", rate: 0.0262},
									{locality: "Frederick County", rate: 0.0296},
									{locality: "Garrett County", rate: 0.0265},
									{locality: "Harford County", rate: 0.0306},
									{locality: "Howard County", rate: 0.0320},
									{locality: "Kent County", rate: 0.0285},
									{locality: "Montgomery County", rate: 0.0320},
									{locality: "Prince George’s County", rate: 0.0320},
									{locality: "Queen Anne’s County", rate: 0.0320},
									{locality: "St. Mary’s County", rate: 0.0300},
									{locality: "Somerset County", rate: 0.0315},
									{locality: "Talbot County", rate: 0.0240},
									{locality: "Washington County", rate: 0.0280},
									{locality: "Wicomico County", rate: 0.0320},
									{locality: "Worcester County", rate: 0.0125}];
		$scope.filingStatuses = [{ status: 'Single', code: 0 },
		{ status: 'Married Filing Separately', code: 1 },
		{ status: 'Dependent taxpayer', code: 2 },
		{ status: 'Married Filing Jointly', code: 3 },
		{ status: 'Head of Household', code: 4 },
		{ status: 'Qualifying widow(er) with dependent child', code: 5 }];
		
		$scope.areYouADependentChoices = ['No', 'Yes', 'Both myself and my spouse'];

		$scope.numberOfDependentChoices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 10, 11, 12 ];
		
		$scope.form = new Maryland502({
			totalTax: '0.00',
			adjustedGrossIncome: '0.00',
			wagesSalariesAndOrTips: '0.00',
			filingStatus: $scope.filingStatuses[0],
			subdivision: $scope.subdivisionChoices[0],
			earnedIncome: "0.00",
			yourself: false,
			you65orOver: false,
			youBlind: false,
			spouseSelf: false,
			spouse65orOver: false,
			spouseBlind: false,
			numberOfDependents: 0,
			numberOfDependentsOver65: 0,
			totalRegularExemptions: 0,
			totalSpecialExemptions: 0,
			standardDeduction: 0.0,
			exemptionAmount: 0.0,
			minimumFilingIncome: 10300.0,
			netTaxableIncome: 0.0,
			bracketRate: 0.0,
			marylandTax: 0.0,
			localTax: 0.0,
			formId: ""
		});

		var syncDropdowns = function($scope, response) {
		  var sdIx = _.findIndex($scope.subdivisionChoices, function(o)
			{
				return o.locality == response.subdivision.locality;
			});
			console.log("sdIx: " + sdIx);
		  $scope.form.subdivision = $scope.subdivisionChoices[sdIx];
		  var fsIx = _.findIndex($scope.filingStatuses, function(o)
			{
				return o.status == response.filingStatus.status;
			});
			console.log("fsIx: " + fsIx);
		  $scope.form.filingStatus = $scope.filingStatuses[fsIx];
		};
		
		var formIdentifier = $cookies.get('formId');

		if (formIdentifier) {
			console.log("formIdentifier: " + formIdentifier);
			Maryland502.query({ "formIdentifier": formIdentifier}, 
				function(response) {
					// console.log("form: " + _.map(response[0]));
					$scope.form = response[0];
					syncDropdowns($scope, response[0]);
				}
			/*
			$scope.form.$get({ "formIdentifier": formIdentifier},
				function(response) {
					// console.log("form: " + _.map(response));
				}
			*/
			);
		} else {
			console.log("cookie not found");
		}
		
		$scope.calculate = function(form) {
			var adjustedGrossIncome = parseFloat(form.adjustedGrossIncome);
			/* console.log("adjustedGrossIncome: " + adjustedGrossIncome); */
			
			form.standardDeduction = calculateStandardDeduction(form);
			
			/* console.log("standard deduction: " + form.standardDeduction); */
			
			form.exemptionAmount = calculateExemption(form);
			
			/* console.log("exemption amount: " + form.exemptionAmount); */

			var minimumFilingIncomesUnder65 = [ 10300.0, 4000.0, 10300.0, 20600.0, 13250.0, 16600.0 ];

			if (form.filingStatus.code === 2 || (!form.you65orOver && !form.spouse65orOver)) {
				form.minimumFilingIncome = minimumFilingIncomesUnder65[form.filingStatus.code];
				/* console.log("minimumFilingIncome: " + minimumFilingIncomesUnder65[form.filingStatus.code]); */
				if (adjustedGrossIncome < form.minimumFilingIncome) { // TODO base this on filing status
					form.totalTax = 0.0;
					return;
				}
			} else {
				// complicated
				var filingStatus = form.filingStatus.code;
				if ((filingStatus === 0 || filingStatus === 2) && form.you65orOver) {
					form.minimumFilingIncome = 11850.0;
				} else if (filingStatus === 3) {
					if (form.you65orOver !== form.spouse65orOver) {
						form.minimumFilingIncome = 21850.0;
					} else if (form.you65orOver && form.spouse65orOver) {
						form.minimumFilingIncome = 23100.0;
					}
				} else if (filingStatus === 1 && form.you65orOver) {
					form.minimumFilingIncome = 4000.0;
				} else if (filingStatus === 4 && form.you65orOver) {
					form.minimumFilingIncome = 14800.0;
				} else if (filingStatus === 5 && form.you65orOver) {
					form.minimumFilingIncome = 17850.0;
				}
				/* console.log("minimumFilingIncome: " + form.minimumFilingIncome); */
				if (adjustedGrossIncome < form.minimumFilingIncome) {
					form.totalTax = 0.0;
					return;
				}
			}
			
			form.netTaxableIncome = adjustedGrossIncome - form.standardDeduction - form.exemptionAmount;
			
			/* console.log("net taxable: " + form.netTaxableIncome); */
			
			form.totalTax = calculateMarylandTax(form);
			
			/* $scope.totalTax = $scope.adjustedGrossIncome + $scope.taxableInterest - $scope.unemploymentCompensation * 100; */
		}
		
		$scope.openControllerAsController = function (form) {
                $rootScope.theme = 'ngdialog-theme-default';
				console.log("IN OPENCONTROLLERASCONTROLLER, subdivision: " + $scope.form.subdivision.locality + ", $" + $scope.form.adjustedGrossIncome);
                ngDialog.open({
                    template: 'controllerAsDialog',
                    controller: 'InsideCtrlAs',
                    controllerAs: 'ctrl',
					scope: $scope,
                    className: 'ngdialog-theme-default custom-style',
                    preCloseCallback: function(value) {
						console.log("IN PRECLOSECALLBACK, subdivision: " + $scope.form.subdivision.locality + ", $" + $scope.form.adjustedGrossIncome);
						// post form to REST API
						  $scope.form.$save(function (response) {
							  // console.log("response: " + _.map(response));
							  syncDropdowns($scope, response);
							// $location.path('form' + response._id); not appropriate in this case
							$cookies.put('formId', $scope.form.formId);
						  }, function (errorResponse) {
							$scope.error = errorResponse.data.message;
						  });
                        /* if (confirm('Close it?  (Value = ' + value + ')')) {
                            return true;
                        } */
                        return true;
                    }
                });
            };
		
		$scope.openControllerAsController2 = function (form) {
                $rootScope.theme = 'ngdialog-theme-default';
				console.log("IN OPENCONTROLLERASCONTROLLER2");
                ngDialog.open({
                    template: 'controllerAsDialog2',
                    controller: 'InsideCtrlAs2',
                    controllerAs: 'ctrl',
					scope: $scope,
                    className: 'ngdialog-theme-default custom-style',
                    preCloseCallback: function(value) {
						console.log("IN PRECLOSECALLBACK2, formId: " + $scope.form.formId);
						Maryland502.query({ "formIdentifier": $scope.form.formId},
							function(response) {
								console.log("form: " + _.map(response[0]));
								$scope.form = response[0];
								syncDropdowns($scope, response[0]);
							}
						);
					}
                });
            };
		
        /* $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.contactFormUrl = "contact-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.saveContact = function(contact) {
            Contacts.editContact(contact);
            $scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.deleteContact = function(contactId) {
            Contacts.deleteContact(contactId);
        } */
    }])
	.controller('InsideCtrlAs', ['$scope', '$rootScope', function ($scope, $rootScope) {
		console.log("in InsideCtrlAs, subdivision: " + $scope.form.subdivision.locality);
		// console.log("*** " + _.map($scope.form));
            // this.value = 'value from controller';
    }])
	.controller('InsideCtrlAs2', ['$scope', '$rootScope', function ($scope, $rootScope) {
		console.log("in InsideCtrlAs2");
    }]);;
	
	var calculateStandardDeduction = function(form) {
		var marylandAdustedGrossIncome = parseInt(form.adjustedGrossIncome); // may want to add intermediate steps
		switch(form.filingStatus.code) {
			case 0:
			case 1:
			case 2:
				if (marylandAdustedGrossIncome < 10000.0) {
					return 1500.0;
				} else if (marylandAdustedGrossIncome > 13333.0) {
					return 2000.0;
				} else {
					return marylandAdustedGrossIncome * 0.15;
				}
			case 3:
			case 4:
			case 5:
				if (marylandAdustedGrossIncome < 20000.0) {
					return 3000.0;
				} else if (marylandAdustedGrossIncome > 26667.0) {
					return 4000.0;
				} else {
					return marylandAdustedGrossIncome * 0.15;
				}
		}
	}
	
	var getBracketValue = function(marylandAdustedGrossIncome) {
		if (marylandAdustedGrossIncome <= 100000.0) {
			return this.bracketValueOne;
		} else if (marylandAdustedGrossIncome > 100000.0 && marylandAdustedGrossIncome <= 125000.0) {
			return this.bracketValueTwo;
		} else if (marylandAdustedGrossIncome > 125000.0 && marylandAdustedGrossIncome <= 150000.0) {
			return this.bracketValueThree;
		} else if (marylandAdustedGrossIncome > 150000.0 && marylandAdustedGrossIncome <= 175000.0) {
			return this.bracketValueFour;
		} else if (marylandAdustedGrossIncome > 175000.0 && marylandAdustedGrossIncome <= 200000.0) {
			return this.bracketValueFive;
		} else {
			return this.bracketValueSix;
		}
	};
	
	var bracketValues01 = { bracketValueOne: 3200.0, bracketValueTwo: 1600.0, bracketValueThree: 800.0,
							bracketValueFour: 0.0, bracketValueFive: 0.0, bracketValueSix: 0.0 };
	var bracketValues345 = { bracketValueOne: 3200.0, bracketValueTwo: 3200.0, bracketValueThree: 3200.0,
							bracketValueFour: 1600.0, bracketValueFive: 800.0, bracketValueSix: 0.0 };
	var getBracketValue01 = _.bind(getBracketValue, bracketValues01);
	var getBracketValue345 = _.bind(getBracketValue, bracketValues345);
	
	var calculateExemptionMultiplier = function(form) {
		var marylandAdustedGrossIncome = parseInt(form.adjustedGrossIncome); // may want to add intermediate steps
		switch(form.filingStatus.code) {
			case 0:
			case 1:
				return getBracketValue01(marylandAdustedGrossIncome);
			case 2:
				return 0.0;
			case 3:
			case 4:
			case 5:
				return getBracketValue345(marylandAdustedGrossIncome);
			default:
				return 0.0; // NaN?
		}
	};
	
	var calculateExemption = function(form) {
			/*
			console.log("you65orOver: " + form.you65orOver);
			console.log("youBlind: " + form.youBlind);
			console.log("spouse65orOver: " + form.spouse65orOver);
			console.log("spouseBlind: " + form.spouseBlind);
			console.log("numberOfDependents: " + form.numberOfDependents);
			console.log("numberOfDependentsOver65: " + form.numberOfDependentsOver65);
			*/
			if (form.filingStatus.code === 2) {
				return 0.0;
			}
			form.totalRegularExemptions = countExemptions(form);
			var exemptionMultiplier = calculateExemptionMultiplier(form);
			/* console.log("exemptionMultiplier: " + exemptionMultiplier); */
			var regularExemptionAmount = form.totalRegularExemptions * exemptionMultiplier;
			/* console.log("regularExemptionAmount: " + regularExemptionAmount); */
			form.totalSpecialExemptions = countSpecialExemptions(form);
			var specialExemptionAmount = 1000.0 * form.totalSpecialExemptions;
			/* console.log("specialExemptionAmount: " + specialExemptionAmount); */
			return regularExemptionAmount + specialExemptionAmount;
	};
	
	var countExemptions = function(form) {
		switch(form.filingStatus.code) {
			case 2: return 0;
			case 0:
			case 1:
			case 5:
					return form.numberOfDependents +
									form.numberOfDependentsOver65 +
									(form.yourself ? 1 : 0);
			case 3:
			case 4:
					return form.numberOfDependents +
									form.numberOfDependentsOver65 +
									(form.yourself ? 1 : 0) +
									(form.spouseSelf ? 1 : 0);
		}
		
	}
	
	var countSpecialExemptions = function(form) {
		switch(form.filingStatus.code) {
			case 2: return 0;
			case 0:
			case 1:
			case 5:
					return (form.you65orOver ? 1 : 0) +
										(form.youBlind ? 1 : 0);
			case 3:
			case 4:
					return (form.you65orOver ? 1 : 0) +
										(form.youBlind ? 1 : 0) +
										(form.spouse65orOver ? 1 : 0) +
										(form.spouseBlind ? 1 : 0);
		}
	}
	
	var calculateMarylandTax = function(form) {
		var bracketsSchedule1 = [{ bottom: 0.0, top: 1000.0, offset: 0.0, rate: 2.0 },
			 { bottom: 1000.0, top: 2000.0, offset: 20.0, rate: 3.0 },
			 { bottom: 2000.0, top: 3000.0, offset: 50.0, rate: 4.0 },
			 { bottom: 3000.0, top: 100000.0, offset: 90.0, rate: 4.75 },
			 { bottom: 100000.0, top: 125000.0, offset: 4697.5, rate: 5.0 },
			 { bottom: 125000.0, top: 150000.0, offset: 5947.5, rate: 5.25 },
			 { bottom: 150000.0, top: 250000.0, offset: 7260.0, rate: 5.5 },
			 { bottom: 250000.0, top: 10000000.0, offset: 12760.0, rate: 5.75 } ];
			 
		var bracketsSchedule2 = [ { bottom: 0.0, top: 1000.0, offset: 0.0, rate: 2.0 },
			 { bottom: 1000.0, top: 2000.0, offset: 20.0, rate: 3.0 },
			 { bottom: 2000.0, top: 3000.0, offset: 50.0, rate: 4.0 },
			 { bottom: 3000.0, top: 150000.0, offset: 90.0, rate: 4.75 },
			 { bottom: 150000.0, top: 175000.0, offset: 7072.5, rate: 5.0 },
			 { bottom: 175000.0, top: 225000.0, offset: 8322.5, rate: 5.25 },
			 { bottom: 225000.0, top: 300000.0, offset: 10947.5, rate: 5.5 },
			 { bottom: 300000.0, top: 10000000.0, offset: 15072.5, rate: 5.75 } ];
			 
		var brackets = form.filingStatus.code > 2 ? bracketsSchedule2 : bracketsSchedule1;
		for (var i=0; i<brackets.length; i++) {
			var bracket = brackets[i];
			if (form.adjustedGrossIncome > bracket.bottom && form.adjustedGrossIncome <= bracket.top) {
				/* console.log("bracket.bottom: " + bracket.bottom + ", bracket.top: " + bracket.top); */
				form.marylandTax = bracket.offset + (form.netTaxableIncome - bracket.bottom) * bracket.rate * 0.01;
				/* console.log("stateTax: " + form.marylandTax); */
				form.bracketRate = bracket.rate;
				break;
			}
		}
		
		form.localTax = form.netTaxableIncome * form.subdivision.rate;
		/* console.log("localTax: " + form.localTax); */
		
		return form.marylandTax + form.localTax;
	};
