var app = angular.module('myApp', ['widgets']);

app.controller('MyCtrl', ['$scope',
    function ($scope) {
        var items = [{
            title: '1'
        }, {
            title: '2'
        }, {
            title: '3'
        }, {
            title: '4'
        }, {
            title: '5'
        }, {
            title: '6'
        }, {
            title: '7'
        }, {
            title: '8'
        }, {
            title: '9'
        }, {
            title: '10'
        }, {
            title: '11'
        }, {
            title: '12'
        }];

        $scope.widgetsOptions = {
            items: items
        }
    }
]);