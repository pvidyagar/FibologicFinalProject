angular.module("profileCntrl", [])

.controller("profileController", ["$scope", "$http", '$uibModal', function($scope, $http, $uibModal) {

    var fetchUserInfo = function() {
        $http.get('/fetchUserInfo').success(function(response) {
            $scope.user = {
                id: response._id,
                name: response.name,
                gender: response.gender,
                email: response.email,
                photo: response.photo,
                mobileno: response.mobileno,
                address: response.address
            };
        });
    };

    angular.element(document).ready(function() {
        fetchUserInfo();
    });

    $scope.updateUserInfo = function(user) {

        var pass = user.pass == undefined ? ' ' : user.pass;

        $http.post('/updateUserInfo', user).success(function(response) {

            var alertUpdate = function() {
                var modalInstance = $uibModal.open({
                    template: '<div class="modal-content">' +
                        '<div class="modal-header" style="text-align : center">' +
                        '<br><h4 class="modal-title" style="color: green">' +
                        'Profile Updated Successfully !</h4><br>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '<button type="button" class="btn btn-default" ng-click="close()">Close</button>' +
                        '</div>' +
                        '</div>',
                    size: 'sm',
                    controller: function($scope, $uibModalInstance) {
                        $scope.close = function() {
                            $uibModalInstance.close();
                        };
                    }
                });
            };

            alertUpdate();
        });
    };
}]);
