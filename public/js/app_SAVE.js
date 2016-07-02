angular.module("marylandTaxApp", ['ngRoute', 'currencyInputMask', 'ui.utils.masks'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "form.html",
                controller: "MarylandTaxController" /*,
                resolve: {
                    contacts: function(Contacts) {
                        return Contacts.getContacts();
                    }
                } */
            }) /*
            .when("/new/contact", {
                controller: "NewContactController",
                templateUrl: "contact-form.html"
            })
            .when("/contact/:contactId", {
                controller: "EditContactController",
                templateUrl: "contact.html"
            }) */
            .otherwise({
                redirectTo: "/"
            })
    })
    /* DEFINE SERVICES AND CONTROLLERS LATER (IN SEPARATE FILES) */
	.service("Maryland502", function($http) {
		/*
        this.getContacts = function() {
            return $http.get("/contacts").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding contacts.");
                });
        } */
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
        /* this.editContact = function(contact) {
            var url = "/contacts/" + contact._id;
            console.log(contact._id);
            return $http.put(url, contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this contact.");
                    console.log(response);
                });
        }
        this.deleteContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this contact.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(contacts, $scope) {
        $scope.contacts = contacts.data;
    })
    .controller("NewContactController", function($scope, $location, Contacts) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveContact = function(contact) {
            Contacts.createContact(contact).then(function(doc) {
                var contactUrl = "/contact/" + doc.data._id;
                $location.path(contactUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditContactController", function($scope, $routeParams, Contacts) {
        Contacts.getContact($routeParams.contactId).then(function(doc) {
            $scope.contact = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
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
        }*/
    })
    .controller("MarylandTaxController", ['$scope', function($scope, $routeParams, Maryland502) {
        /* Contacts.getContact($routeParams.contactId).then(function(doc) {
            $scope.contact = doc.data;
        }, function(response) {
            alert(response); NO BACK END FOR NOW */
        /* }); */

		$scope.totalTax = '0.00';
		$scope.adjustedGrossIncome = '0.00';
		$scope.taxableInterest = '0.00';
		$scope.unemploymentCompensation = '0.00';
		$scope.filingStatus = "Single";
		$scope.filingStatuses = ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household', 'Qualifying widow(er) with dependent child', 'Dependent taxpayer'];
		$scope.areYouADependent = "No";
		$scope.areYouADependentChoices = ['No', 'Yes', 'Both myself and my spouse'];
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
		$scope.subdivision = $scope.subdivisionChoices[0];
		$scope.stateTaxWithheld = "0.00";
		$scope.calculate = function () {
			$scope.totalTax = parseInt($scope.adjustedGrossIncome) + parseInt($scope.taxableInterest);
			$scope.totalTax += parseInt($scope.unemploymentCompensation);
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