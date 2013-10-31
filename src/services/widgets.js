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
            pack: function (widgets) {
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
            },
            unpack: function (items) {
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
        }
    }
}

angular.module('widgets.services').provider('$widgets', $WidgetsProvider);