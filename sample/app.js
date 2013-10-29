function random(max) {
    return Math.floor((Math.random()*max)+1);
}

var Generators = {
    temperature: function () {
        return random(30);
    },
    rgbled: function () {
        return random(255).toString(16) + random(255).toString(16) + random(255).toString(16);
    }
};

function generateSampleDevices(types) {
    var devices = [];
    types.forEach(function (type, index) {
        devices.push({
            guid: 'SAMPLE-DEVICE_' + index,
            deviceType: type
        });
    });
    return devices;
}

function getSampleDevices() {
    return generateSampleDevices([
        'temperature',
        'temperature',
        'temperature',
        'rgbled',
        'rgbled',
        'rgbled',
        'temperature',
        'rgbled'
    ]);
}

var __widgets;
function loadWidgets() {
    if (!__widgets) {
        __widgets = window.localStorage.widgets && JSON.parse(window.localStorage.widgets);
    }
    return __widgets;
}

function saveWidgets(widgets) {
    __widgets = null;
    var items = [];
    widgets.forEach(function (widget) {
        items.push({
            device: widget.device
        })
    });
    window.localStorage.widgets = JSON.stringify(items);
}

function findWidget(widgets, id) {
    for(var i = 0; i < widgets.length; i++) {
        if (widgets[i].id == id) return widgets[i];
    }
    return null;
}

function loopGenerate(widgets, $timeout) {
    $timeout(function () {
        angular.forEach(widgets, function (widget) {
            widget.data({DA: Generators[widget.device.deviceType]()});
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

            // load widgets
            var widgets = [];
            var items = loadWidgets();
            if (items) {
                angular.forEach(items, function (item) {
                    widgets.push(new Widgets[item.device.deviceType]({device: item.device}))
                });
            } else {
                angular.forEach(getSampleDevices(), function (device) {
                    widgets.push(new Widgets[device.deviceType]({device: device}));
                });
                saveWidgets(widgets);
            }

            // load widgets resources
            var promises = [];
            angular.forEach(widgets, function (widget) {
                promises.push(widget.loadResources());
            });

            $q.all(promises).then(function () {
                $scope.widgets = widgets;
                loopGenerate(widgets, $timeout);
                $timeout(function () {
                    $rootScope.$broadcast(':widgetsLoaded', widgets);
                });
            });
        });

        $scope.widgets = [];
        $scope.widgetsOptions = {
            widgets: 'widgets'
        };

        $rootScope.$on(':widgetsReordered', function (event, ids) {
            var widgets = [];
            ids.forEach(function (id) {
                widgets.push(findWidget($scope.widgets, id));
            });
            saveWidgets(widgets);
        });
    }
]);