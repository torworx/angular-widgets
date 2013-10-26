$WidgetsDirective.$inject = ['$templateCache'];
function $WidgetsDirective($templateCache) {
    return {
        template: $templateCache.get('widgets.html'),
        replace: true,
        restrict: 'EA',
        link: function($scope, iElement, iAttrs) {
            console.log('widgets');
            var options = $scope.$eval(iAttrs.ngWidgets);
            var defaults = angular.extend({
                width: 250,
                height: 210
            }, options.defaults || {});
            delete options.defaults;

            var items = [];
            angular.forEach(options.items || [], function (item) {
                items.push(angular.extend({}, defaults, item));
            }, items);
            delete options.items;
            $scope.items = items;

            angular.extend($scope, options);
        }
    };
}

angular.module('widgets.directives').directive('ngWidgets', $WidgetsDirective);