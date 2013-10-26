
$WidgetDirective.$inject = ['$templateCache'];
function $WidgetDirective($templateCache) {
    console.log('create widget directive');
    return {
        template: $templateCache.get('widget.html'),
        replace: true,
        restrict: 'EA',
        link: function($scope, iElement) {
            var $el = $(iElement);
            var item = $scope.item;

            $scope.title = item.title;

            $el.attr('id', $scope.widget.id);
            $el.width(item.width);
            $el.height(item.height);

            console.log($scope);
        }
    };
}

angular.module('widgets.directives').directive('ngWidget', $WidgetDirective);