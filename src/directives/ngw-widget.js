$WidgetDirective.$inject = ['$rootScope', '$templateCache', '$sce', '$timeout'];
function $WidgetDirective($rootScope, $templateCache, $sce, $timeout) {

    return {
        template: $templateCache.get('widget.html'),
        replace: true,
        restrict: 'EA',
        link: function ($scope, element) {

            var $el = $(element);
            var $elBody = element.find('.x-panel-body');

            var widget = $scope.widget;

            $scope.title = widget.name || widget.settings.name;
            $scope.view = $sce.trustAsHtml(widget.view);
            $scope.style = $sce.trustAsHtml(widget.style);

            $el.attr('id', widget.id);

            $el.width(widget.width);
            $el.height(widget.height);
            if (widget.bodyCls) {
                $elBody.addClass(widget.bodyCls);
            }

            $scope.toolOnClick = function (item, $event) {
                if ($event.stopPropagation) $event.stopPropagation();
                if ($event.preventDefault) $event.preventDefault();
                if (isFunction(item.handler)) {
                    item.handler($event, $scope);
                }
            };

            $scope.deleteWidget = function () {
                $scope.$parent.deleteWidget(widget);
            };

            $timeout(function () {
                widget.initialize({
                    scope: $scope,
                    element: $elBody,
                    $timeout: $timeout
                });
                widget.widgetize();
            });

            /**
             * Select a Widget
             */
            $scope.$on(":widgetSelect", function (event, widget) {
                $scope.selected = false;

                if (widget.id === $scope.widget.id) {
                    $scope.selected = !$scope.selected;
                    $rootScope.$broadcast($scope.selected ? ":widgetSelected" : ":widgetDeselected", widget);
                }
            });
        }
    };
}

angular.module('ng.widgets.directives').directive('ngwWidget', $WidgetDirective);