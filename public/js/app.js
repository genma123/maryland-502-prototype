angular.module("marylandTaxApp", ['ngRoute', 'ngResource', 'currencyInputMask', 'ui.utils.masks'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "form.html",
                controller: "MarylandTaxController"
			})
            .otherwise({
                redirectTo: "/"
            })
    })
	/*.service("Maryland502", function($http) {
        this.createMaryland502 = function(form) {
            return $http.post("/forms", form).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating form.");
                });
        }
        this.getMaryland502 = function(formId) {
            var url = "/forms/" + formId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this form.");
                });
		}
    }) */
 	.factory('Maryland502', ['$resource',
	  function ($resource) {
		return $resource('api/form/:form', {
		  form: '@_id'
		}, {
		  update: {
			method: 'PUT'
		  }
		}, {
		  get: {
			method: 'GET'
		  }
		}, {
		  query: {
			method: 'GET', isArray: true
		  }
		});
	  }
	])
    .controller("MarylandTaxController", ['$scope', '$routeParams', 'Maryland502',
		function($scope, $routeParams, Maryland502) {
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
			numberOfDependents: 0
		});
		
		$scope.calculate = function(form) {
			var adjustedGrossIncome = form.adjustedGrossIncome;
			
			if (adjustedGrossIncome < 10300.0) { // TODO base this on filing status
				form.totalTax = 0.0;
			}
			
			var standardDeduction = calculateStandardDeduction(form);
			
			console.log("standard deduction: " + standardDeduction);
			
			var exemptionAmount = calculateExemption(form);
			
			console.log("exemption amount: " + exemptionAmount);
			
			var netTaxable = parseInt(form.adjustedGrossIncome) - standardDeduction - exemptionAmount;
			
			console.log("net taxable: " + netTaxable);
			
			form.totalTax = calculateMarylandTax(form, netTaxable);
			
			/* $scope.totalTax = $scope.adjustedGrossIncome + $scope.taxableInterest - $scope.unemploymentCompensation * 100; */
		}
		
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
    }]);
	
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
			console.log("you65orOver: " + form.you65orOver);
			console.log("youBlind: " + form.youBlind);
			console.log("spouse65orOver: " + form.spouse65orOver);
			console.log("spouseBlind: " + form.spouseBlind);
			console.log("numberOfDependents: " + form.numberOfDependents);
			if (form.filingStatus.code === 2) {
				return 0.0;
			}
			var totalRegularExemptions = form.numberOfDependents +
						(form.yourself ? 1 : 0) +
						(form.spouseSelf ? 1 : 0);
			var exemptionAmount = calculateExemptionMultiplier(form);
			console.log("exemptionAmount: " + exemptionAmount);
			return exemptionAmount * totalRegularExemptions;
	};
	
	var calculateMarylandTax = function(form, netTaxable) {
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
		
		var stateTax = 0.0;
		for (var i=0; i<brackets.length; i++) {
			var bracket = brackets[i];
			if (form.adjustedGrossIncome > bracket.bottom && form.adjustedGrossIncome <= bracket.top) {
				stateTax = bracket.offset + (netTaxable - bracket.bottom) * bracket.rate * 0.01;
				break;
			}
		}
		
		var localTax = netTaxable * form.subdivision.rate;
		
		return stateTax + localTax;
	};
