$SizableDirective.$inject = ['$rootScope'];
function $SizableDirective($rootScope) {

    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            var $el = $(element);
            var baseWidth = $el.width();
            var baseHeight = $el.height();
            var gutter = 20;

            scope.$watch('widget.settings.sizeX', function (newX, oldX) {
                element.width(baseWidth * newX + (gutter * (newX - 1)));
                $rootScope.$broadcast(":layoutChanged");
            });

            scope.$watch('widget.settings.sizeY', function (newY, oldY) {
                element.height(baseHeight * newY + (gutter * (newY - 1)));
                $rootScope.$broadcast(":layoutChanged");
            });
        }
    }
}
angular.module('widgets.directives').directive('ngwSizable', $SizableDirective);