
$WidgetDirective.$inject = ['$templateCache', '$sce', '$timeout'];
function $WidgetDirective($templateCache, $sce, $timeout) {
    return {
        template: $templateCache.get('widget.html'),
        replace: true,
        restrict: 'EA',
        link: function($scope, element) {

            var $el = $(element);
            var widget = $scope.widget;
            var $elBody = element.find('.x-body');

            $scope.title = widget.name;
            $scope.view = $sce.trustAsHtml(widget.view);
            $scope.style = $sce.trustAsHtml(widget.style);

            $el.attr('id', widget.id);

            $el.width(widget.width);
            $el.height(widget.height);
            if (widget.bodyCls) {
                $elBody.addClass(widget.bodyCls);
            }

            $timeout(function () {
                widget._initialize($scope, $elBody);
            });
        }
    };
}

angular.module('widgets.directives').directive('ngWidget', $WidgetDirective);