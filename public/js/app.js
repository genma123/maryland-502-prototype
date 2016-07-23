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
    });
