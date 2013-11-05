function $WidgetsProvider() {

    var debugWidgets = debug('ngw:widgets-service');
    var service = {},
        queue = [],
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
            this.widgetName = name;
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

    this.extend = function (object) {
        extend(service, object);
    };

    this.$get = $get;
    $get.$inject = ['$q', '$http'];
    function $get($q, $http) {
        var resources = new Resources($q, $http);

        var promise = flush($q, $http).then(function (results) {
            forEach(results, function (clazz) {
                if (!clazz) return;
                definitions.push(clazz);
                definitionsMap[clazz.widgetName] = clazz;
            });
        }, function (reason) {
            console.err('widgets load failed: ' + reason);
        });

        extend(service, {
            ready: promise,
            definitions: definitions,
            widget: function (name, data) {
                if (!data) {
                    data = name;
                    name = data.widgetName;
                }
                if (!name) throw new Error('Invalid arguments for create widget', arguments);
                var Widget = definitionsMap[name];
                if (!Widget) {
                    return console.error('Unknown widget: ' + name);
                }
                return new Widget(data);
            },
            loadResources: function (widgets) {
                if (!isArray(widgets)) widgets = [widgets];
                var promises = [];
                forEach(widgets, function (widget) {
                    promises.push(resources.loadViewAndStyle(widget));
                });
                return $q.all(promises).then(function () {
                    return widgets;
                });
            },
            pack: pack,
            unpack: unpack
        });

        return service;
    }
}

angular.module('ng.widgets.services').provider('$widgets', $WidgetsProvider);