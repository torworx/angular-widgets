var app = angular.module('myApp', ['widgets']);

app.config(['$widgetsProvider', function ($widgetsProvider) {
    $widgetsProvider.load('widgets/rgbled');
}]);

app.controller('MyCtrl', ['$rootScope', '$scope', '$q', '$widgets',
    function ($rootScope, $scope, $q, $widgets) {
        $widgets.ready.then(function () {
            console.log('widgets ready');
            var items = [], promises = [];
            angular.forEach($widgets.definitions, function (Widget) {
                var widget = new Widget({});
                promises.push(widget.loadResources());
                items.push(widget);
            });
            $q.all(promises).then(function () {
                $scope.items = items;
            });
        });

        $scope.items = [];
        $scope.widgetsOptions = {
            widgets: 'items'
        }
    }
]);