$WidgetDirective.$inject = ['$rootScope', '$templateCache', '$sce', '$compile', '$timeout'];
function $WidgetDirective($rootScope, $templateCache, $sce, $compile, $timeout) {

    return {
        template: $templateCache.get('widget.html'),
        replace: true,
        restrict: 'EA',
        link: function ($scope, element) {

            var $el = $(element);
            var $elBody = element.find('.x-widget-body');

            var widget = $scope.widget;

            _.extend($scope, $scope.$parent.defaults);

            $scope.style = $sce.trustAsHtml(widget.style);

            $el.attr('id', widget.id);
            $el.width($scope.width);
            $el.height($scope.height);
            if ($scope.bodyCls) {
                $elBody.addClass($scope.bodyCls);
            }

            $scope.updateBodyHTML = function () {
                $elBody.empty();
                $scope.HTML = widget.view;
                var el;
                try {
                    el = angular.element($scope.HTML);
                } catch (e) {
                    el = angular.element("<div>" + $scope.HTML + "</div>");
                }
                $elBody.html($compile(el)($scope));
            };

            $scope.run = function () {
                widget.run({
                    scope: $scope,
                    element: $elBody
                });
            };

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

            $timeout(function () {
                $scope.updateBodyHTML();
                $scope.run();
                $scope.$apply();
            });
        }
    };
}

angular.module('ng.widgets.directives').directive('ngwWidget', $WidgetDirective);