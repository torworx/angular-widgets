function $WidgetsProvider() {

    var queue = [],
        definitions = [];

    function declare(statics) {
        var constructor = function (options, element) {
            // allow instantiation without "new" keyword
            if (!this._init) {
                return new constructor(options, element);
            }

            // allow instantiation without initializing for simple inheritance
            // must use "new" keyword (the code above always passes args)
            if (arguments.length) {
                this._init(options, element);
            }

            return this;
        };

        extend(constructor, statics);
        constructor.prototype = angular.extend(new Widget(), {
            constructor: constructor
        });
        return constructor;
    }

    this.define = define;
    function define(statics, prototype) {
        if (!prototype) {
            prototype = statics;
            statics = {};
        }

        if (isString(statics)) {
            statics = {widgetName: statics};
        }

        var constructor = declare(statics);
        extend(constructor.prototype, prototype);
        queue.push({clazz: constructor});
    }

    this.load = function (statics, url) {
        if (!url) {
            url = statics;
            statics = {};
        }

        if (isString(statics)) {
            statics = {widgetName: statics};
        }

        var constructor = declare(statics);
        queue.push({ clazz: constructor, url: url });
    };

    function WidgetLoader($http, $q) {
        return {
            load: function load(clazz, url) {
                var d = $q.defer();
                $http.get(url + '/widget.js')
                    .success(function (data) {
                        console.log('loaded widget: ' + url);
                        var fn = new Function('define', data);
                        fn(function (prototype) {
                            extend(clazz.prototype, prototype);
                            clazz.location = url;
                            clazz.prototype.location = url;
                            return clazz;
                        });
                        d.resolve(clazz);
                    })
                    .error(function (err) {
                        console.err("Could not load widget: " + url);
                        d.resolve();
//                        d.reject("Could not load widget: " + url);
                    });
                return d.promise;
            }
        }
    }

    function loadResourcesFn(resources, $q) {
        return function () {
            var self = this;
            if (!self._resready) {
                var promises = [];
                promises.push(resources.load(this, 'view', 'view.html'));
                promises.push(resources.load(this, 'style', 'style.less', function (extension, source) {
                    if (extension == 'less') {
                        return '#' + self.id + ' .view { ' + source + ' }';
                    }
                    return source;
                }));
                self._resready = $q.all(promises);
            }
            return self._resready;
        }
    }

    function flush($http, $q) {
        var loader = WidgetLoader($http, $q);
        var promises = [];
        forEach(queue, function (item) {
            if (item.url) {
                promises.push(loader.load(item.clazz, item.url));
            } else {
                promises.push($q.when(item.clazz));
            }
        });
        return $q.all(promises);
    }

    this.$get = $get;
    $get.$inject = ['$http', '$q'];
    function $get($http, $q) {
        var resources = new Resources($http, $q);
        var loadResources = loadResourcesFn(resources, $q);

        var promise = flush($http, $q).then(function (results) {
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