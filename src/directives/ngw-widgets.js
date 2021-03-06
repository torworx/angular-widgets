$WidgetsDirective.$inject = ['$rootScope', '$templateCache', '$timeout'];
function $WidgetsDirective($rootScope, $templateCache, $timeout) {
    var debugWidgetsDirective = debug('ngw:widgets-directive')
    return {
        template: $templateCache.get('widgets.html'),
        replace: true,
        restrict: 'EA',
        scope: true,
        link: function($scope, element, attrs) {
            console.log('widgets directive link');
            var options = $scope.$eval(attrs.ngwWidgets);
            if (!options) return;

            $scope.defaults = extend({
                width: 250,
                height: 210,
                cls: 'x-panel-default',
                selectedCls: 'x-panel-selected'
            }, options.defaults);

            if (typeof options.widgets === 'string') {
                $scope.$parent.$watch(options.widgets, function (widgets) {
                    update(widgets);
                });
            } else {
                update(options.widgets);
            }

            function update(widgets) {
                $scope.widgets = widgets;
                $timeout(function () {
                    $rootScope.$broadcast(':widgetsLoaded', $scope.widgets);
                });
            }
            
            $scope.selectWidget = function (widget) {
                debugWidgetsDirective('selecting widget #' + widget.id, widget);
                $rootScope.$broadcast(':widgetSelect', widget);
            };

            $scope.deleteWidget = function (widget) {
                debugWidgetsDirective('deleting widget #' + widget.id);
                $scope.widgets.splice($scope.widgets.indexOf(widget), 1);
                $rootScope.$broadcast(':widgetDeleted', widget, $scope.widgets);
                $timeout(function () {
                    $rootScope.$broadcast(':widgetsLoaded', $scope.widgets);
                });
            };
        }
    };
}

angular.module('ng.widgets.directives').directive('ngwWidgets', $WidgetsDirective);