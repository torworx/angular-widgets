$WidgetsDirective.$inject = ['$templateCache'];
function $WidgetsDirective($templateCache) {
    return {
        template: $templateCache.get('widgets.html'),
        replace: true,
        restrict: 'EA',
        scope: true,
        link: function($scope, iElement, iAttrs) {
            console.log('widgets directive link');
            var options = $scope.$eval(iAttrs.ngWidgets);
            if (!options) return;

            var defaults = extend({
                width: 250,
                height: 180
            }, options.defaults || {});

            if (typeof options.widgets === 'string') {
                $scope.$parent.$watch(options.widgets, function (widgets) {
                    console.log('widgets changed', widgets);
                    update(widgets);
                });
            } else {
                update(options.widgets);
            }

            function update(widgets) {
                console.log('update widgets', widgets);
                var _widgets = [];
                angular.forEach(widgets || [], function (widget) {
                    _widgets.push(merge(widget, defaults));
                });
                $scope.widgets = _widgets;
            }
        }
    };
}

angular.module('widgets.directives').directive('ngWidgets', $WidgetsDirective);