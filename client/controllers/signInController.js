angular
		.module("signinCntrl", [])
		.controller(
				'signInController',
				[
						'$scope',
						'$http',
						'$uibModal',
						'$uibModalInstance',
						'$rootScope',
						function($scope, $http, $uibModal, $uibModalInstance,
								$rootScope) {
							$scope.user = {};
							$scope.user.email = $rootScope.Email;
							$scope.user.password = $rootScope.Password;

							$scope.showSignUp = function(size) {
								$uibModalInstance.close();
								var modalInstance = $uibModal.open({
									templateUrl : 'partials/signUp.html',
									controller : "signUpController",
									size : size
								});

							};

							$scope.loginPage = function() {
								$scope.emailValue = $rootScope.Email;
								$uibModalInstance.close();
								var modalInstance = $uibModal.open({
									templateUrl : 'partials/signIn.html',
									controller : 'signInController',
									size : 'lg'
								});
							};

							$scope.login = function(user) {
								$http.post('/checkLogin', user)
										.success(
												function(response) {
													if (response == null) {
														$scope.err = "Invalid Username or Password";
													} else {
														$scope.err = "";
														$uibModalInstance
																.close();
														$http
																.post('/login',
																		user)
																.success(
																		function(
																				response) {

																			location
																					.reload();
																			// $window.location.reload();
																		});
													}
												})
							};

						}

				]);