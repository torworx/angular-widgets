$WidgetDirective.$inject = ['$rootScope', '$templateCache', '$sce', '$timeout'];
function $WidgetDirective($rootScope, $templateCache, $sce, $timeout) {

    return {
        template: $templateCache.get('widget.html'),
        replace: true,
        restrict: 'EA',
        link: function ($scope, element) {

            var $el = $(element);
            var widget = $scope.widget;
            var $elBody = element.find('.x-body');

            $scope.title = widget.name + ' #' + widget.id;
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

            /**
             * Select a Widget
             */
            $scope.$on(":widgetSelect", function (event, widget) {
                $scope.selected = false;

                if (widget.id === $scope.widget.id) {
                    $scope.selected = !$scope.selected;

                    var guids = [];
                    forEach($scope.widget.devices, function (device, guid) {
                        this.push(guid);
                    }, guids);
                    $rootScope.$broadcast($scope.selected ? ":widgetDevicesSelect" : ":widgetDevicesDeselect", guids);
                }
            });
        }
    };
}

angular.module('widgets.directives').directive('ngwWidget', $WidgetDirective);