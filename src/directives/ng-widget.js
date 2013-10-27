
$WidgetDirective.$inject = ['$templateCache', '$sce', '$timeout'];
function $WidgetDirective($templateCache, $sce, $timeout) {
    return {
        template: $templateCache.get('widget.html'),
        replace: true,
        restrict: 'EA',
        link: function($scope, iElement) {

            var $el = $(iElement);
            var widget = $scope.widget;
            var $elView = iElement.find('.view');

            $scope.title = widget.name;
            $scope.view = $sce.trustAsHtml(widget.view);
            $scope.style = $sce.trustAsHtml(widget.style);

            $el.attr('id', widget.id);

            $el.width(widget.width);
            $elView.height(widget.height);


            $timeout(function () {
                widget.widgetize($scope, $elView);
            });
        }
    };
}

angular.module('widgets.directives').directive('ngWidget', $WidgetDirective);