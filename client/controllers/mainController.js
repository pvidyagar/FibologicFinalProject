var app = angular.module("myApp", [ 'ui.router', 'ui.bootstrap',
		'ui-rangeSlider', 'profileCntrl', 'bodyCntrl', 'signinCntrl',
		'signupCntrl', 'regCntrl', 'approveRecipeCntrl','cartCntrl','ngCookies']);

app.config([ '$stateProvider', '$urlRouterProvider', '$locationProvider',
		function($stateProvider, $urlRouterProvider, $locationProvider) {

			$urlRouterProvider.otherwise('/body');

			$stateProvider.state('body', {
				url : '/body',
				templateUrl : 'partials/homeBody.html',
				controller : 'bodyController'
			}).state('profile', {
				url : '/profile',
				templateUrl : 'partials/userProfile.html',
				controller : 'profileController'
			}).state('recipeRegistration', {
				url : '/recipeRegistration',
				templateUrl : 'partials/recipeRegistration.html',

			}).state('approveRecipe', {
				url : '/approveRecipe',
				templateUrl : 'partials/approveRecipe.html',
				controller : 'approveRecipeController'
			}).state('myCart', {
	            url: '/myCart',
	            templateUrl: 'partials/myCart.html',
	            controller:'cartController'
	                  
	        })
			
		} ]);

app.run([ '$rootScope', function($rootScope) {
	$rootScope.userRole = "";
	$rootScope.registeredEmail = " ";
	$rootScope.Password = "";
	$rootScope.userName = ""
	$rootScope.cartItems=[];
    $rootScope.itemCount=0;
    $rootScope.browserLocation = {};
} ]);

'use strict';
function Cart() {
  return {
    'cartId': '',
    'cartItem': []
  };
}
// custom service maintains the cart along with its behavior to clear itself , create new , delete Item or update cart
 
app.value('sessionService', {
  cart: new Cart(),
  clear: function() {
    this.cart = new Cart();
    // mechanism to create the cart id 
    this.cart.cartId = 1;
  },
  save: function(session) {
    this.cart = session.cart;
  },
  updateCart: function(productId, productQty) {
    this.cart.cartItem.push({
      'productId': productId,
      'productQty': productQty
    });
  },
//delete Item and other cart operations function goes here...
});

app
		.controller(
				"mainController",
				[
						'$scope',
						'$http',
						'$uibModal',
						'$rootScope',
						'$cookies',
						function($scope, $http, $uibModal, $rootScope,$cookies) {
							
							var checkErrorConditions = function(browserLocation){
								
								if(browserLocation=="D"){
									console.log("User denied the request for Geolocation.");
									return true;
								}
								if(browserLocation=="U"){
									console.log("Location information is unavailable.");
									return true;
								}
								if(browserLocation=="T"){
									console.log("The request to get user location timed out.");
									return true;
								}
								if(browserLocation=="X"){
									console.log("An unknown error occurred.");
									return true;
								}
								if(browserLocation=="N"){
									console.log("Browser does not support.");
									return true;
								}
								if(browserLocation[0] == "{"){
									return false;
								}
								return true;
								
							}
							 var myInt = setInterval(function() {
								 var browserLocationElement = document.getElementById('browserLocation')
							     if (browserLocationElement.value !== "" ) {
							    	 if(checkErrorConditions(browserLocationElement.value)==false){
								       $rootScope.browserLocation = JSON.parse(browserLocationElement.value);
								       $scope.$apply();
							    	 }
							    	 clearInterval(myInt);
							     }
							   }, 1500);
							
							
							
							
							$scope.logout = function() {
								$http.get('/logout').success(
										function(response) {
											$cookies.remove('itemCount');
											$cookies.remove('cartItems');
											$cookies.remove('showGuest');
											$scope.user=null;
											$http.get('/');
											location.reload();
										});
							};
							
							$scope.dropdown=false;
							$scope.logoutDropdown = function() {
								$scope.dropdown=true;
							};

							$scope.login = function(role) {

								$rootScope.userRole = role;

								$http.post('/userRole' + role);

								var modalInstance = $uibModal.open({
									templateUrl : 'partials/signIn.html',
									controller : 'signInController',
									size : 'lg'
								});
							};

							

							$scope.showDetails = function(id) {
								$http.get('/showDetails/' + id).success(
										function(response) {
											$scope.view = response;
										});
							};

							$scope.showContact = false;

							$scope.clickContact = function() {
								$scope.showContact = !$scope.showContact;
							};

						} ]);
