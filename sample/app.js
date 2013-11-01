function generateSampleDevices(types) {
    var devices = {};
    types.forEach(function (type, index) {
        var guid = 'SAMPLE-DEVICE_' + index;
        devices[guid] = {
            GUID: guid,
            deviceType: type
        };
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

function random(max) {
    return Math.floor((Math.random() * max) + 1);
}

var generators = {
    temperature: function () {
        return random(30);
    },
    rgbled: function () {
        return random(255).toString(16) + random(255).toString(16) + random(255).toString(16);
    }
};

function generateData(device) {
    return {GUID: device.GUID, DA: generators[device.deviceType]()};
}


function loopGenerate($rootScope, widgets, $timeout) {
    $timeout(function () {
        var widget = widgets[random(widgets.length) - 1];
        angular.forEach(widget.devices, function (device) {
            $rootScope.$broadcast(':data', generateData(device));
        });
        loopGenerate($rootScope, widgets, $timeout);
    }, 5000);
}

var app = angular.module('myApp', ['widgets', 'ui.bootstrap']);

app.config(function ($widgetsProvider) {
    var properties = ['devices', 'settings'];
    $widgetsProvider.WidgetClass.extend({
        toObject: function () {
            return _.pick(this, properties);
        },

        afterInitialize: function () {
            var self = this;
            this.scope.$on(':data', function (event, data) {
                if (self.devices.hasOwnProperty(data.GUID)) {
                    self.devices[data.GUID].last_data = data;
                    self.onData(data);
                }
            });
        },

        afterWidgetize: function () {
            var self = this;
            this.$timeout(function () {
                _.each(self.devices, function (device, key) {
                    if (device && device.last_data) {
                        var dataObject = {
                            G: device.gid,
                            V: device.vid,
                            D: device.did,
                            node: device.node
                        };
                        _.extend(dataObject, device.last_data);
                        self.onData(dataObject);
                    }
                });
            });
        }
    });

    $widgetsProvider.load('temperature', 'widgets/temperature');
    $widgetsProvider.load('rgbled', 'widgets/rgbled');
});

app.service('storage', function ($widgets) {
    var __widgets;
    this.loadWidgets = function () {
        try {
            if (!__widgets && window.localStorage) {
                if (window.localStorage.widgets) {
                    __widgets = $widgets.unpack(JSON.parse(window.localStorage.widgets));
                }
            }
        } catch (e) {
            console.log(e);
        }

        return __widgets;
    };

    this.saveWidgets = function (widgets) {
        __widgets = null;

        try {
            if (window.localStorage) {
                var items = $widgets.pack(widgets);
                window.localStorage.widgets = items ? JSON.stringify(items) : null;
            }
        } catch (e) {
            console.log(e);
        }
    };

    this.clearWidgets = function () {
        __widgets = null;
        try {
            if (window.localStorage) delete window.localStorage.widgets;
        } catch (e) {
            console.log(e);
        }
    }

});

app.controller('MyCtrl', function ($rootScope, $scope, $q, $timeout, $http, $modal,
                                   $widgets, storage) {
    $widgets.ready.then(function () {
        // load widgets
        var widgets = storage.loadWidgets() || (function () {
            var results = [];
            angular.forEach(getSampleDevices(), function (device, guid) {
                var devices = {};
                devices[guid] = device;
                results.push($widgets.widget(device.deviceType, {
                    devices: devices
                }));
            });
            storage.saveWidgets(results);
            return results;
        })();

        // load widgets resources
        var promises = [];
        angular.forEach(widgets, function (widget) {
            promises.push(widget.loadResources());
        });

        $q.all(promises).then(function () {
            $scope.widgets = widgets;
            $timeout(function () {
                loopGenerate($rootScope, widgets, $timeout);
            });
        });
    });

    $scope.widgets = [];
    $scope.widgetsOptions = {
        widgets: 'widgets',
        defaults: {
//            selectedCls: 'panel-primary'
        },
        widget: {
            tools: [
                {
                    iconCls: 'glyphicon glyphicon-cog',
                    handler: function ($event, scope) {
                        $modal.open({
                            templateUrl: "settings.html",
                            scope: scope
                        }).result.then(function () {
                                console.log("OK");
                            }, function () {
                                console.log("Cancel");
                            });
                    }
                }
            ]
        }
    };

    $scope.clear = function () {
        storage.clearWidgets();
    };

    $rootScope.$on(':widgetsReordered', function (event, ids) {
        $scope.widgets = _.sortBy($scope.widgets, function (widget) {
            return ids.indexOf(widget.id);
        });
        storage.saveWidgets($scope.widgets);
    });

    $rootScope.$on(':widgetDeleted', function (event, widget) {
        storage.saveWidgets($scope.widgets);
    });
});
