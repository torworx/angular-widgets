$WidgetsDirective.$inject = ['$templateCache'];
function $WidgetsDirective($templateCache) {
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

            var defaults = extend({
                width: 250,
                height: 210
            }, options.defaults || {});

            if (typeof options.widgets === 'string') {
                $scope.$parent.$watch(options.widgets, function (widgets) {
                    update(widgets);
                });
            } else {
                update(options.widgets);
            }

            function update(widgets) {
                $scope.widgets = [];
                angular.forEach(widgets || [], function (widget) {
                    $scope.widgets.push(merge(widget, defaults));
                });
            }
            
            $scope.select = function (widget) {
                debugWidgetsDirective('select widget #' + widget.id);
                $scope.$broadcast(':widgetSelect', widget);
            }
        }
    };
}

angular.module('widgets.directives').directive('ngwWidgets', $WidgetsDirective);