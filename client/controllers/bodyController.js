
var app = angular.module('bodyCntrl', ["checklist-model"]);

app.directive('textOverflowHover', function() {
    return {
        link: function(scope, element, attr) {
            var boxwidth = $("div.recipeNameBox").width();
            $(element).hover(
                function() {
                    $(this).stop().animate({
                        textIndent: "-" + ($(this).width() - boxwidth) + "px"
                    }, 800);
                },
                function() {
                    $(this).stop().animate({
                        textIndent: "0"
                    }, 800);
                }
            );
        }
    }
});


app.controller(
		"bodyController",
		[
				'$scope',
				'$http',
				'$state',
				'$rootScope',
				'$cookies',
				function($scope, $http, $state, $rootScope, $cookies) {
					$scope.notFound = false;
					$scope.menu = true;
                    var cartItems=[];
					$scope.showContact = false;
					$scope.foodTypeNames = [];
					$scope.cuiseneNames = [];
					$scope.counter = 0;
					$scope.clickContact = function() {
						$scope.showContact = !$scope.showContact;
					};

					var myDate = new Date();
					var tomorrow = new Date();
					var datDate = new Date();

					$scope.today = myDate;
					$scope.tomorrow = tomorrow.setDate(tomorrow.getDate() + 1);
					$scope.dat = datDate.setDate(datDate.getDate() + 2);

					/*reloadBody - function is called when there is some error in retrieval via formatAllfilters */
					$scope.reloadBody = function() {
						$http({
									url : '/getMenuByFilters/method',
									method : "POST",
									// data: data,
									headers : {
										'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
									}
								}).success(function(response) {

							$scope.elasticData = true;
							$scope.menuItems = response;
						});
					};

					/* reference values setup for the filters dropdown*/
					$scope.foodType = function() {
						$http.get('/foodType').success(
								function(response) {
									$scope.foodTypeNames = response;
								});
					};
					$scope.cuisineType = function() {
						$http.get('/cuisineType').success(
								function(response) {
									$scope.cuiseneNames = response;
								});
					};
					$scope.price = {
						minRange : 1,
						maxRange : 500,
						min : 1,
						max : 500
					};
					$scope.foodPreferences = [ "Veg", "Non Veg" ];

					

					$scope.filterPost = function() {
						$http(
								{
									url : '/getMenuByFilters/method',
									method : "POST",
									data : data,
									headers : {
										'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
									}
								}).success(function(response) {
							$scope.elasticData = true;
							$scope.menuItems = response;
							$cookies.put("allFilters", JSON.stringify($scope.allFilters));
							console.log("$scope.allFilters.selectedUserAddress="+$scope.allFilters.selectedUserAddress);
							document.getElementById('selectedUserAddress').value = $scope.allFilters.selectedUserAddress;
							console.log("document.getElementById('selectedUserAddress').value="+document.getElementById('selectedUserAddress').value);
							
						});
					};

					$scope.formatAllfilters = function() {
						console.log("$scope.allFilters ="
								+ JSON.stringify($scope.allFilters));
						data = $.param({
							allFilters : $scope.allFilters,
						});
						$scope.filterPost();
					};
					var data;

					if($cookies.get('allFilters')!=undefined){
						$scope.allFilters= JSON.parse($cookies.get("allFilters"));
						$scope.formatAllfilters();
					}else{
						$scope.allFilters = {
							selectedPriceSort : undefined,
							selectedCuisine : [],
							selectedFoodType : [],
							selectedFoodPref : [],
							selectedLocation : undefined,
							sliderMinPrice : 1,
							sliderMaxPrice : 500,
							isApprovedRecipe : "A",
							selectedUserAddress : ""
						};
						$scope.formatAllfilters();
					}

					$scope.sliderStops = function() {
						$scope.allFilters.sliderMinPrice = $scope.price.min;
						$scope.allFilters.sliderMaxPrice = $scope.price.max;
						$scope.formatAllfilters();
					};

					function getLocation(latitude, longitude) {
						this.lat = latitude;
						this.lon = longitude;
					}

					$scope.addressUpdated = function() {
						if ($scope.details != undefined && $scope.details.geometry != undefined) {
							$scope.allFilters.selectedLocation =  
								new getLocation( $scope.details.geometry.location.lat(),
										         $scope.details.geometry.location.lng());
						} else {
							$scope.allFilters.selectedLocation = undefined;
						}
						$scope.formatAllfilters();
					}

					/* This method is used for reverse geocoding: get address from the lat and lon*/
					$scope.getAddressFromGeoLocation = function() {
						var geoCoder = new google.maps.Geocoder;
				        var latlng = {
				        	lat: $rootScope.browserLocation.lat, 
				        	lng: $rootScope.browserLocation.lon
				        };
				        geoCoder.geocode({'location': latlng}, 
				        	function(results, status) {
						        if (status === google.maps.GeocoderStatus.OK) {
						            if (results[1]) {
							            $scope.allFilters.selectedUserAddress = results[1].formatted_address;
							            console.log("New selectedUserAddress from browser location is updated="+$scope.allFilters.selectedUserAddress);
						            	$scope.$apply();
						            } else {
						            	  console.log('No results found for given lat and lon');
						            }
						        } else {
						        	console.log('Geocoder failed due to: ' + status);
						    }
						});
				    }
					
					$scope.setBrowserLocation = function(){
							$scope.allFilters.selectedLocation= {
					        	lat: $rootScope.browserLocation.lat, 
					        	lon: $rootScope.browserLocation.lon
					        };
							$scope.getAddressFromGeoLocation();
					}
					$scope.isEmptyObject = function(inputObject)
				    {
				    	var temp ={};
				    	if(JSON.stringify(inputObject) == JSON.stringify(temp)){
				    		return true;
				    	}
				    	return false;
				    }
					$rootScope.$watch('browserLocation', function(newValue,oldValue){
						if(newValue != oldValue){
							if(!$scope.isEmptyObject($rootScope.browserLocation)){	
								if($scope.allFilters.selectedLocation == undefined){
									$scope.setBrowserLocation();
									$scope.formatAllfilters();
								}
							}
						}
					});
					$scope.$watch('allFilters.selectedUserAddress', function(newValue,oldValue) {
						if(newValue != oldValue){
							if ($scope.allFilters.selectedUserAddress!== undefined && $scope.allFilters.selectedUserAddress.length < 1) {
								if($scope.details != undefined){
									$scope.details = undefined; 
								}
								else{
									$scope.details = {};
								}
							}
						}
					});

					$scope.$watch('details', function(newValue,oldValue) {
						if(newValue != oldValue){
							$scope.allFilters.selectedUserAddress=$scope.result;
							$scope.addressUpdated();
						}
						return;
					});

					$scope.sendFeedback = function(recipe) {
						var feeedbackData = {
							feedbackCount : recipe.feedbackCount,
							averageRating : recipe.averageRating,
							recipeID : recipe._id,
							rating : 4,
							comment : "Its awesome!",
							emailID : 'vjhaveri@nisum.com'
						};
						$http
								.post('/sendFeedback', feeedbackData)
								.success(
										function(response) {
											console
													.log("Recipe Feedback"
															+ response);
										})
					};

					if ($cookies.get('cartItems') != undefined) {
						cartItems = JSON.parse($cookies.get('cartItems'));
						$rootScope.itemCount = JSON.parse($cookies.get("itemCount"));									
					}
					
					if($cookies.get('showGuest') != undefined){
						$rootScope.showGuest = JSON.parse($cookies.get("showGuest"));
					}
				
					var pushItemToCart = function(menuItem){
						cartItems.push({
							id : menuItem._id,
							name : menuItem.name[0],
							price : menuItem.price[0],
							chef : menuItem.chef[0],
							image : menuItem.imageUrls[0],
							quantity : 1
						});
		        		$rootScope.itemCount++;
					}
					var pushItemToCartDetails = function(menuItem){
						cartItems.push({
							id : menuItem._id,
							name : menuItem.name,
							price : menuItem.price,
							chef : menuItem.chef,
							image : menuItem.imageUrls[0],
							quantity : 1
						});
		        		$rootScope.itemCount++;
					}
					
					$scope.addToCart = function(menuItem) {
						console.log("addToCart menuItem="+JSON.stringify(menuItem));
						
						$rootScope.showGuest = true;									
						$cookies.put("showGuest", JSON.stringify($rootScope.showGuest));
						
						var flag=0;
						if(cartItems.length != 0){
				          for(var i=0; i< cartItems.length; i++){
				        	  if(cartItems[i].id == menuItem._id ){
				        		  flag=1;
				        		  if(cartItems[i].quantity<10){
				        			  cartItems[i].quantity= cartItems[i].quantity + 1;
				        			  break;
				        		  }
				        	  }
				          }
				        }
						if(flag==0){
							console.log("menuItem Being pushed="+menuItem);
							pushItemToCart(menuItem);
						}
				        console.log(JSON.stringify(cartItems));
						$cookies.put("cartItems", JSON.stringify(cartItems));
						$cookies.put("itemCount", JSON.stringify($rootScope.itemCount));							
					}
					
					$scope.addToCartDetails = function(menuItem) {
						$rootScope.showGuest = true;
						$cookies.put("showGuest", JSON.stringify($rootScope.showGuest));
						console.log("addToCart menuItem="+JSON.stringify(menuItem));
						var flag=0;
						if(cartItems.length != 0){
				          for(var i=0; i< cartItems.length; i++){
				        	  if(cartItems[i].id == menuItem._id ){
				        		  flag=1;
				        		  if(cartItems[i].quantity<10){
				        			  cartItems[i].quantity= cartItems[i].quantity + 1;
				        			  break;
				        		  }
				        	  }
				          }
				        }
						if(flag==0){
							console.log("menuItem Being pushed="+menuItem);
							pushItemToCartDetails(menuItem);
						}
				        console.log(JSON.stringify(cartItems));
						$cookies.put("cartItems", JSON.stringify(cartItems));
						$cookies.put("itemCount", JSON.stringify($rootScope.itemCount));
					}
					
					
					$scope.add=function(itemPrice, total,id){
						if($scope.qty[id]<10){
							$scope.qty[id]=$scope.qty[id]+1;
							$scope.total= $scope.total+itemPrice;
							//console.log($scope.qty[id]);
						}
					};
					
					
		            $scope.showDetailsElastic = function(singleItem) {
		            	$scope.menuHoverDetails = singleItem;
		            	$scope.detailsFoodPref = singleItem.foodPreference[0];
		            };
					
				} ]);

