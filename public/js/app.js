angular.module("marylandTaxApp", ['ngRoute', 'ngResource', 'ngCookies', 'currencyInputMask', 'ui.utils.masks', 'ngDialog'])
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "form.html",
                controller: "MarylandTaxController"
			})
            .otherwise({
                redirectTo: "/"
            });
		$locationProvider.html5Mode(true);
    }).config(['ngDialogProvider', function (ngDialogProvider) {
            ngDialogProvider.setDefaults({
                className: 'ngdialog-theme-default',
                plain: false,
                showClose: true,
                closeByDocument: true,
                closeByEscape: true,
                appendTo: false,
                preCloseCallback: function () {
                    console.log('default pre-close callback');
                }
            });
    }]).config(['$cookiesProvider', function ($cookiesProvider) {
			$cookiesProvider.defaults.path = '/'; 
	}]);
