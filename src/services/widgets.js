function $WidgetsProvider() {

    var debugWidgets = debug('ngw:widgets-service');
    var queue = [],
        definitions = [];

    function declare(statics, data) {
        if (!data) {
            data = statics;
            statics = {};
        }

        if (isString(statics)) {
            statics = {widgetName: statics};
        }

        var NewClass = function WidgetConstructor(options) {
            // allow instantiation without "new" keyword
            if (!(this instanceof WidgetConstructor)) {
                return new WidgetConstructor(options);
            }

            Widget.call(this, options);
            extend(this, data);
            // post create
            if (this._create) {
                this._create(options);
            }
            return this;
        };

        // inherit Widget methods
        extend(NewClass, Widget, statics);
        extend(NewClass.prototype, Widget.prototype);

        return NewClass;
    }

    this.define = define;
    function define(statics, data) {
        queue.push(function ($q) {
            return $q.when(declare(statics, data));
        });
    }

    this.load = function (statics, url) {
        if (!url) {
            url = statics;
            statics = {};
        }

        queue.push(function ($q, $http) {
            var WidgetClass;
            var d = $q.defer();
            $http.get(url + '/widget.js')
                .success(function (data) {
                    debugWidgets('loaded widget: ' + url);
                    var fn = new Function('define', data);
                    fn(function (data) {
                        WidgetClass = declare(statics, data);
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
            return function(source) {
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
            });
        }, function (reason) {
            console.err('widgets load failed: ' + reason);
        });

        return {
            ready: promise,
            definitions: definitions
        }
    }
}

angular.module('widgets.services').provider('$widgets', $WidgetsProvider);