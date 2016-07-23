'use strict';

angular.module("marylandTaxApp")
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
	]);
