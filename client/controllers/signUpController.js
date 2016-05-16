var app = angular.module("signupCntrl", [])

app.run(['$rootScope', function($rootScope) {
    $rootScope.Email = "";
    $rootScope.Password = "";
}]);

app.controller('signUpController', [
    '$scope',
    '$uibModal',
    '$uibModalInstance',
    '$rootScope',
    '$http',
    function($scope, $uibModal, $uibModalInstance, $rootScope, $http) {

        $scope.signup = function() {
            var role = $rootScope.userRole;
            var registredEmail = $scope.user.email;
            var registredPassword = $scope.user.password;

            $http.post('/signUpData/' + role, $scope.user).success(function(response) {
                $scope.Unique = response;
                if ($scope.Unique === true) {
                    $rootScope.Email = registredEmail;
                    $uibModalInstance.close();
                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/emailError.html',
                        controller: "signInController",
                        size: 'sm'
                    });
                } else {
                    $rootScope.Email = registredEmail;
                    $rootScope.Password = registredPassword;
                    console.log($rootScope.Email);
                    $uibModalInstance.close();
                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/signIn.html',
                        controller: "signInController",
                        size: 'lg'
                    });
                }
            })
        };
    }
]);
