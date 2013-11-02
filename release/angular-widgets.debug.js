/***********************************************
* angular-widgets JavaScript Library
* Authors: https://github.com/torworx/angular-widgets/blob/master/README.md 
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 2013-11-02 23:44
***********************************************/
(function(window, $) {
'use strict';
function AssetsCompiler() {
    this.addCompilers();
}

AssetsCompiler.prototype.compile = function (extension, source, callback) {
    if (!callback) callback = function(){};
    var compiler = this.getCompiler(extension);
    if (!compiler) {
        return callback();
    }
    var options = {} || compiler.options;

    compiler.render(source, options, function(err, compiledCode) {
        if (err) {
            return callback(err);
        }
        return callback(null, compiledCode);
    });
    return true;
};

/**
 * Returns the correct Compiler for the given extension
 * @param {String} extension
 */
AssetsCompiler.prototype.getCompiler = function(extension) {
    var compiler;
    if(!(compiler = this.compilers[extension])) {
        console.log('AssetsCompiler: Compiler ' + extension + ' not implemented');
    }
    return compiler;
};

AssetsCompiler.prototype.hasCompiler = function(extension) {
    return !!this.compilers[extension];
};

AssetsCompiler.prototype.compilers = {};

/**
 * Adds a new compiler.
 * @param {String||[String,...]} extensions string or array of strings that represent
 *   the extensions this compiler handles
 * @param {Object} options should contain a render function, and any other options for the compiler
 */
AssetsCompiler.prototype.add = function(extensions, options) {
    var self = this;
    extensions = extensions instanceof Array ? extensions : [extensions];
    extensions.forEach(function(extension) {
        self.compilers[extension] = {};
//        self.configure(extension, self.defaultCompilerOptions);
        self.configure(extension, options);
    });
    return this;
};

/**
 * Configuers an existing compiler
 * @param {String} extension the extension for the compiler to be configured
 * @param {Object} options the options to be set on the compiler object
 */
AssetsCompiler.prototype.configure = function(extension, options) {
    var compiler = this.compilers[extension], key;
    if (compiler) {
        for (key in options) {
            if (options.hasOwnProperty(key) ) {
                compiler[key] = options[key];
            }
        }
    }
    return this;
};

/**
 * Add Available compilers
 */
AssetsCompiler.prototype.addCompilers = function() {
    var self = this;
    self.add('less', {
        render: function(str, options, fn) {
            this.less = this.less || less;
            try {
                var parser = new(this.less.Parser)();
                parser.parse(str, function (e, tree) {
                    if (e) {throw e;}
                    fn(null, tree.toCSS());
                });
            } catch (err) {
                fn(err);
            }
        }
    });
};
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var idSeed = 0,
    isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy,
    noop = angular.noop;

function id() {
    return idSeed++;
}

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

/**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
function ancestors(first, second) {
    var path = [];

    for (var n in first.path) {
        if (first.path[n] === "") continue;
        if (!second.path[n]) break;
        path.push(first.path[n]);
    }
    return path;
}

angular.module('ng.widgets.directives', []);
angular.module('ng.widgets.services', []);
angular.module('ng.widgets', ['ng.widgets.directives', 'ng.widgets.services']);
/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function debug(name) {
    if (!debug.enabled(name)) return function(){};

    return function(fmt){
        var args = Array.prototype.slice.call(arguments);
        var curr = new Date;
        var ms = curr - (debug[name] || curr);
        debug[name] = curr;

        args[0] = name
            + ' - '
            + fmt
            + ' +' + debug.humanize(ms);

        // This hackery is required for IE8
        // where `console.log` doesn't have 'apply'
        window.console
            && console.log
        && Function.prototype.apply.call(console.log, console, args);
    }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
    try {
        localStorage.debug = name;
    } catch(e){}

    var split = (name || '').split(/[\s,]+/)
        , len = split.length;

    for (var i = 0; i < len; i++) {
        name = split[i].replace('*', '.*?');
        if (name[0] === '-') {
            debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
        }
        else {
            debug.names.push(new RegExp('^' + name + '$'));
        }
    }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
    debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
    var sec = 1000
        , min = 60 * 1000
        , hour = 60 * min;

    if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
    if (ms >= min) return (ms / min).toFixed(1) + 'm';
    if (ms >= sec) return (ms / sec | 0) + 's';
    return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
    for (var i = 0, len = debug.skips.length; i < len; i++) {
        if (debug.skips[i].test(name)) {
            return false;
        }
    }
    for (var i = 0, len = debug.names.length; i < len; i++) {
        if (debug.names[i].test(name)) {
            return true;
        }
    }
    return false;
};

// persist

if (window.localStorage) debug.enable(localStorage.debug);

function Resources($q, $http) {

    var debugResources = debug('ngw:resources');

    /**
     *
     * @param object
     * @param prop
     * @param resName
     * @returns {*|Promise}
     */
    this.load = function (object, prop, resName) {
        var d, p,
            data = object[prop],
            dataUrl = object[prop + 'Url'];
        if (object.location) {
            dataUrl = object.location + '/' + (dataUrl || resName);
        }

        if (data) {
            p = $q.when(data);
        } else if (dataUrl) {
//            var i = dataUrl.lastIndexOf('.');
//            var extension = i < 0 ? '' : dataUrl.substring(i + 1);
            d = $q.defer();
            debugResources('loading resource "' + prop + '" from ' + dataUrl);
            $http.get(dataUrl).then(function (result) {
                d.resolve(result.data);
//                var source = intercept ? intercept(extension, result.data) : result.data;
//                if (assetsCompiler.hasCompiler(extension)) {
//                    assetsCompiler.compile(extension, source, function (err, compiledCode) {
//                        d.resolve(compiledCode);
//                    });
//                } else {
//                    d.resolve(source);
//                }

            });
            p = d.promise;
        }
        return p || $q.when();
    };
}

function $WidgetsProvider() {

    var debugWidgets = debug('ngw:widgets-service');
    var queue = [],
        definitions = [],
        definitionsMap = {};

    this.WidgetClass = WidgetClass;

    function declare(name, settings, properties) {
        if (!properties) {
            properties = settings;
            settings = null;
        }

        var NewClass = function WidgetConstructor(data) {
            if (!(this instanceof WidgetConstructor)) {
                return new WidgetConstructor(data);
            }

            WidgetClass.call(this, data);
            return this;
        };

        // inherit Widget methods
        extend(NewClass, WidgetClass, {widgetName: name});
        extend(NewClass.prototype, WidgetClass.prototype, properties);

        if (settings) {
            NewClass.settings = settings;
            NewClass.prototype.settings = settings;
        }

        return NewClass;
    }

    this.define = define;
    function define(name, settings, data) {
        queue.push(function ($q) {
            return $q.when(declare(name, settings, data));
        });
    }

    this.load = function (name, url) {
        if (!url) {
            url = name;
        }
        queue.push(function ($q, $http) {
            var WidgetClass;
            var d = $q.defer();
            $http.get(url + '/widget.js')
                .success(function (data) {
                    debugWidgets('loaded widget: ' + url);
                    var fn = new Function('define', data);
                    fn(function (settings, prototype) {
                        if (!prototype) {
                            prototype = settings;
                            settings = {};
                        }
                        WidgetClass = declare(name, settings, prototype);
                        WidgetClass.location = url;
                        WidgetClass.prototype.location = url;
                        return WidgetClass;
                    });
                    d.resolve(WidgetClass);
                })
                .error(function (err) {
                    console.err("Could not load widget: " + url);
                    d.resolve();
//                        d.reject("Could not load widget: " + url);
                });
            return d.promise;
        });
    };

    var assetsCompiler = new AssetsCompiler();

    function loadResourcesFn(resources, $q) {
        return function () {
            var self = this;
            if (!self._resready) {
                var promises = [];
                promises.push(resources.load(self, 'view', 'view.html')
                    .then(assignResource(self, 'view')));

                promises.push(resources.load(self, 'style', 'style.less')
                    .then(compileStyles(self.id))
                    .then(assignResource(self, 'style')));

                self._resready = $q.all(promises);
            }
            return self._resready;
        };

        function compileStyles(id) {
            return function (source) {
                var d = $q.defer();
                assetsCompiler.compile('less', '#' + id + ' { ' + source + ' }', function (err, compiledCode) {
                    if (err) {
                        console.error(err);
                    }
                    d.resolve(compiledCode);
                });
                return d.promise;
            }
        }

        function assignResource(object, prop) {
            return function (source) {
                object[prop] = source;
            }
        }
    }

    function flush($q, $http) {
        var promises = [];
        forEach(queue, function (fn) {
            promises.push(fn($q, $http));
        });
        return $q.all(promises);
    }

    this.pack = pack;
    function pack(widgets) {
        if (!widgets) return null;
        if (!isArray(widgets)) widgets = [widgets];
        var results = [];
        forEach(widgets, function (widget) {
            this.push({
                type: widget.constructor.widgetName,
                data: widget.toObject()
            });
        }, results);
        return results;
    }

    this.unpack = unpack;
    function unpack(items) {
        if (!items) return null;
        if (!isArray(items)) items = [items];
        var results = [];
        forEach(items, function (item) {
            var Widget = definitionsMap[item.type];
            if (!Widget) return console.error('Unknown widget: ' + item.type);
            return this.push(new Widget(item.data));
        }, results);
        return results;
    }


    this.$get = $get;
    $get.$inject = ['$q', '$http'];
    function $get($q, $http) {
        var resources = new Resources($q, $http);
        var loadResources = loadResourcesFn(resources, $q);

        var promise = flush($q, $http).then(function (results) {
            forEach(results, function (clazz) {
                if (!clazz) return;
                clazz.prototype.loadResources = loadResources;
                definitions.push(clazz);
                definitionsMap[clazz.widgetName] = clazz;
            });
        }, function (reason) {
            console.err('widgets load failed: ' + reason);
        });

        return {
            ready: promise,
            definitions: definitions,
            widget: function (name, data) {
                var Widget = definitionsMap[name];
                if (!Widget) {
                    return console.error('Unknown widget: ' + name);
                }
                return new Widget(data);
            },
            pack: pack,
            unpack: unpack
        }
    }
}

angular.module('ng.widgets.services').provider('$widgets', $WidgetsProvider);
function WidgetClass(data) {
    this.id = 'widget-' + id();
    this._initProperties(data);
}

WidgetClass.prototype._initProperties = function (data) {
    extend(this, data);
};

WidgetClass.prototype.initialize = function (options) {
    extend(this, options);
    this.afterInitialize();
};

WidgetClass.prototype.widgetize = function () {
    this._widgetize();
    this.afterWidgetize();
};

WidgetClass.prototype.afterInitialize = noop;
WidgetClass.prototype._widgetize = noop;
WidgetClass.prototype.afterWidgetize = noop;

WidgetClass.prototype.toObject = function () {
    return {};
};

WidgetClass.extend = function (data) {
    extend(WidgetClass.prototype, data);
};
$DraggabillyDirective.$inject = ['$rootScope'];
function $DraggabillyDirective($rootScope) {

    var debugDrag = debug("ngw:draggabilly");

    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {

            var draggie = null;

            var dragInit = function() {
                draggie = new Draggabilly(element[0], {
                    handle: '.drag-handle'
                });

                draggie.on('dragEnd', function(draggieInstance, event, pointer) {
                    debugDrag('drag end');
                });
            };


            var mediaQuery = "screen and (min-width: 480px)";
            enquire.register(mediaQuery, {

                match: function() {
                    // SETUP PACKERY
                    draggie.enable();
                    debugDrag("matched");
                },

                unmatch: function() {
                    // DISABLE PACKERY
                    draggie.disable();
                    debugDrag("unmatched");
                },

                deferSetup: false,

                setup: function() {
                    dragInit();
                    debugDrag("setup");
                    if (!enquire.queries[mediaQuery].mql.matches) {
                        draggie.disable();
                    }
                }

            });

            $rootScope.$broadcast(':draggabilly', draggie);

            $rootScope.$on(':undraggable', function() {
                draggie.disable();
            });

            $rootScope.$on(':draggable', function() {
                draggie.enable();
            })
        }
    }
}

angular.module('ng.widgets.directives').directive('ngwDraggabilly', $DraggabillyDirective);
$PackeryDirective.$inject = ['$rootScope', '$timeout'];
function $PackeryDirective($rootScope, $timeout) {

    var packery;

    var debugPackery = debug("ngw:packery");
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            function packeryInit() {
                debugPackery('init');

                packery = new Packery(element[0], {
                    itemSelector: attrs.ngwPackery,
                    columnWidth: 250,
                    rowHeight: 210,
                    gutter: 20,
                    isInitLayout: false
                });

                // LAYOUT COMPLETE
                packery.on('layoutComplete', function(packery, items) {
                    // debugPackery("Packery Layout Complete", packery, items);
                });

                packery.on('dragItemPositioned', function(packery, draggedItem) {
                    debugPackery("widgets order changed");

                    if (!$scope.$$phase) {
                        $scope.$apply(function() {

                            var newItems = packery.items;
                            var ids = [];
                            forEach(newItems, function (item) {
                                ids.push(item.element.id);
                            });

                            $rootScope.$broadcast(':widgetsReordered', ids);


//                            var widgetIds = _.map(newItems, function(item) { return item.element.id; });
//
//                            _.each(widgetIds, function(id, index) {
//                                var widget = _.find(NBUser.DashboardSettings.Widgets, function(widget) { return widget.id === id; });
//                                widget.settings.sortOrder = index;
//                            });

                            // Update the Dashboard Widgets sort order
//                            NBUser.DashboardSettings.Widgets = _.sortBy(NBUser.DashboardSettings.Widgets, function(widget) { return widget.settings.sortOrder; });
//                            NBUser.SavePreferences();

                        });
                    }

                    $rootScope.$broadcast(':widgetsOrderUpdated', draggedItem);
                })
            }

            function packeryRefresh() {
                if (packery) {
                    debugPackery("refreshing");
                    packery.reloadItems();
                    packery.layout();

                    element.find(attrs.ngwPackery).css({
                        opacity: 1
                    });
                }
            }

            function packeryRelease() {

                if (packery && packery.destroy) {
                    debugPackery("destroy");
                    packery.destroy();
                }
                packery = null;

                // Reset element CSS
                element.find(attrs.ngwPackery).css({
                    top: 'auto', left: 'auto', position: 'relative', opacity: 1
                });
            }

            function forceShowItems() {
                $timeout(function() {
                    element.find(attrs.ngwPackery).css({
                        opacity: 1
                    });
                }, 0)
            }

            // SCREEN MEDIA QUERIES
            var mediaQuery = "screen and (min-width: 480px)";
            enquire.register(mediaQuery, {

                match: function() {
                    debugPackery("matched");
                    // SETUP PACKERY
                    packeryInit();
                    packeryRefresh();
                    $rootScope.$broadcast(":draggable");
                },

                unmatch: function() {
                    $timeout(function() {
                        // DISABLE PACKERY
                        packeryRelease();
                        // forceShowItems();
                        debugPackery("unmatched");
                        element.find(attrs.ngwPackery).css({
                            top: '', left: '', position: 'relative', opacity: 1
                        });
                        $rootScope.$broadcast(":undraggable");
                    }, 100)
                },

                deferSetup: false,

                setup: function() {

                    debugPackery("setup");
                    if (enquire.queries[mediaQuery].mql.matches) {
                        packeryInit();
                    } else {
                        forceShowItems();
                        $rootScope.$broadcast(":undraggable");
                    }
                }
            });

            $rootScope.$on(":widgetsLoaded", function(event, widgets) {
                if (enquire.queries[mediaQuery].mql.matches) {
                    packeryRefresh();
                } else {
                    forceShowItems();
                }

            });

            $rootScope.$on(":draggabilly", function(event, draggie) {
                if (packery) {
                    packery.bindDraggabillyEvents(draggie);
                }
            });

            $rootScope.$on(":layoutChanged", function(event) {
                $timeout(function() {
                    packeryRefresh();
                }, 500)
            });

            $rootScope.$on(":packeryDestroy", function(event) {
                packeryRelease();
            });
        }
    }
}

angular.module('ng.widgets.directives').directive('ngwPackery', $PackeryDirective);
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
angular.module('ng.widgets.directives').directive('ngwSizable', $SizableDirective);
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
$WidgetsDirective.$inject = ['$rootScope', '$templateCache', '$timeout'];
function $WidgetsDirective($rootScope, $templateCache, $timeout) {
    var debugWidgetsDirective = debug('ngw:widgets-directive')
    return {
        template: $templateCache.get('widgets.html'),
        replace: true,
        restrict: 'EA',
        scope: true,
        link: function($scope, element, attrs) {
            console.log('widgets directive link');
            var options = $scope.$eval(attrs.ngwWidgets);
            if (!options) return;

            var defaults = extend({
                width: 250,
                height: 210,
                cls: 'x-panel-default',
                selectedCls: 'x-panel-selected'
            }, options.defaults || {});

            if (typeof options.widgets === 'string') {
                $scope.$parent.$watch(options.widgets, function (widgets) {
                    update(widgets);
                });
            } else {
                update(options.widgets);
            }

            function update(widgets) {
                $scope.widgets = widgets;
                angular.forEach(widgets, function (widget) {
                    merge(widget, defaults);
                    extend(widget, options.widget);
                });

                $timeout(function () {
                    $rootScope.$broadcast(':widgetsLoaded', $scope.widgets);
                });
            }
            
            $scope.selectWidget = function (widget) {
                debugWidgetsDirective('selecting widget #' + widget.id, widget);
                $rootScope.$broadcast(':widgetSelect', widget);
            };

            $scope.deleteWidget = function (widget) {
                debugWidgetsDirective('deleting widget #' + widget.id);
//                var _widget = copy(widget);
                $scope.widgets.splice($scope.widgets.indexOf(widget), 1);
                $rootScope.$broadcast(':widgetDeleted', widget, $scope.widgets);
                $timeout(function () {
                    $rootScope.$broadcast(':widgetsLoaded', $scope.widgets);
                });
            };
        }
    };
}

angular.module('ng.widgets.directives').directive('ngwWidgets', $WidgetsDirective);
angular.module("ng.widgets").run(["$templateCache", function($templateCache) {

  $templateCache.put("widget.html",
    "<div class=\"x-panel\" ng-class=\"selected ? widget.selectedCls : widget.cls\">\n" +
    "    <div class=\"x-panel-header drag-handle\" ng-click=\"selectWidget(widget)\">\n" +
    "        <h1>{{title}}</h1>\n" +
    "        <div class=\"x-tools x-pull-right\">\n" +
    "            <span class=\"x-tool\"\n" +
    "                  ng-class=\"tool.iconCls || ''\"\n" +
    "                  ng-click=\"toolOnClick(tool, $event)\"\n" +
    "                  ng-repeat=\"tool in widget.tools\">\n" +
    "            </span>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"x-panel-body\" ng-bind-html=\"view\"></div>\n" +
    "    <style type=\"text/css\" ng-bind-html=\"style\"></style>\n" +
    "</div>\n" +
    "\n"
  );

  $templateCache.put("widgets.html",
    "<section id=\"widgets-container\" class=\"x-widgets-container meticulous clearfix\">\n" +
    "    <div ngw-packery=\".x-widget\" class=\"widgets packery\">\n" +
    "        <div class=\"x-widget\" ngw-widget ngw-draggabilly ngw-sizable ng-repeat=\"widget in widgets\"></div>\n" +
    "    </div>\n" +
    "</section>"
  );

}]);

}(window, jQuery));