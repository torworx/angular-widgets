/***********************************************
* angular-widgets JavaScript Library
* Authors: https://github.com/torworx/angular-widgets/blob/master/README.md 
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 2013-10-23 20:26
***********************************************/
(function(window, $) {
'use strict';


'use strict';

var isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy;

function inherit(parent, extra) {
    return extend(new (extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
    forEach(arguments, function(obj) {
        if (obj !== dst) {
            forEach(obj, function(value, key) {
                if (!dst.hasOwnProperty(key)) dst[key] = value;
            });
        }
    });
    return dst;
}


function ancestors(first, second) {
    var path = [];

    for (var n in first.path) {
        if (first.path[n] === "") continue;
        if (!second.path[n]) break;
        path.push(first.path[n]);
    }
    return path;
}

angular.module('widgets.directives', []);
angular.module('widgets', ['widgets.directives']);
$WidgetDirective.$inject = ['$templateCache'];
function $WidgetDirective($templateCache) {
    console.log('create widget directive');
    return {
        template: $templateCache.get('widget.html'),
        replace: true,
        restrict: 'EA',
        link: function($scope) {
            $scope.title = $scope.widget.title;
        }
    };
}

angular.module('widgets.directives').directive('ngWidget', $WidgetDirective);
$WidgetsDirective.$inject = ['$templateCache'];
function $WidgetsDirective($templateCache) {
    return {
        template: $templateCache.get('widgets.html'),
        replace: true,
        restrict: 'EA',
        link: function($scope) {
            console.log('widgets link');
        }
    };
}

angular.module('widgets.directives').directive('ngWidgets', $WidgetsDirective);
angular.module("widgets").run(["$templateCache", function($templateCache) {

  $templateCache.put("widget.html",
    "<div class=\"panel panel-default\">\n" +
    "    <div class=\"panel-heading\">\n" +
    "        <h3 class=\"panel-title\">\n" +
    "            {{title}}\n" +
    "        </h3>\n" +
    "    </div>\n" +
    "    <div class=\"panel-body\"></div>\n" +
    "</div>\n"
  );

  $templateCache.put("widgets.html",
    "<div>\n" +
    "    <div ng-widget ng-repeat=\"widget in widgets\"></div>\n" +
    "</div>"
  );

}]);

}(window, jQuery));