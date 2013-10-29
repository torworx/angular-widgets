function random(max) {
    return Math.floor((Math.random()*max)+1);
}

function Temperature() {
    this.deviceType = 'temperature';
    this.generate = function () {
        return random(30);
    }
}

function RGBLED() {
    this.deviceType = 'rgbled';
    this.generate = function () {
        return random(255).toString(16) + random(255).toString(16) + random(255).toString(16);
    }
}

var devices = {
    'SAMPLE-DEVICE_1': new Temperature(),
    'SAMPLE-DEVICE_2': new RGBLED(),
    'SAMPLE-DEVICE_3': new Temperature(),
    'SAMPLE-DEVICE_4': new RGBLED(),
    'SAMPLE-DEVICE_5': new RGBLED()
};

function loopGenerate(widgets, $timeout) {
    $timeout(function () {
        angular.forEach(widgets, function (widget) {
            widget.data({DA: widget.device.generate()});
        });
        loopGenerate(widgets, $timeout);
    }, 1000);
}

var app = angular.module('myApp', ['widgets']);

app.config(['$widgetsProvider', function ($widgetsProvider) {
    $widgetsProvider.load({deviceType: 'temperature'}, 'widgets/temperature');
    $widgetsProvider.load({deviceType: 'rgbled'}, 'widgets/rgbled');
}]);

app.controller('MyCtrl', ['$rootScope', '$scope', '$q', '$timeout', '$widgets',
    function ($rootScope, $scope, $q, $timeout, $widgets) {
        $widgets.ready.then(function () {
            var Widgets = {};
            angular.forEach($widgets.definitions, function (Widget) {
                Widgets[Widget.deviceType] = Widget;
            });

            var items = [], promises = [];
            angular.forEach(devices, function (device) {
                var widget = new Widgets[device.deviceType]({device: device});
                promises.push(widget.loadResources());
                items.push(widget);
            });
            $q.all(promises).then(function () {
                $scope.items = items;
                loopGenerate(items, $timeout);
                $timeout(function () {
                    $rootScope.$broadcast('!widgetsLoaded', items);
                });
            });
        });

        $scope.items = [];
        $scope.widgetsOptions = {
            widgets: 'items'
        }
    }
]);