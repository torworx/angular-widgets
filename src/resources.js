function Resources($q, $http) {

    var debugResources = debug('ngw:resources');


    function loadResource(location, file) {
        var dataUrl = location + '/' + file;

        debugResources('loading resource "' + file + '" from ' + dataUrl);

        var d = $q.defer();
        $http.get(dataUrl).then(function (result) {
            d.resolve(result.data);
        });
        return d.promise;
    }

    /**
     *
     * @param location
     * @param resources
     *  {
     *      view: 'view.html',
     *      style: 'style.less'
     *  }
     * @returns {*} promise
     *  {
     *      view: ...,
     *      style: ...
     *  }
     */
    this.load = function (location, resources) {
        var props = [];
        var promises = [];
        forEach(resources, function (file, prop) {
            props.push(prop);
            promises.push(loadResource(location, file));
        });
        return $q.all(promises).then(function (resources) {
            var results = {};
            forEach(resources, function (res, index) {
                results[props[index]] = res;
            });
            return results;
        });
    };

    var assetsCompiler = new AssetsCompiler();
    this.loadViewAndStyle = function (widget) {
        return this.load(widget.location, { view: 'view.html', style: 'style.less' })
            .then(function (results) {
                var d = $q.defer();
                compileStyle(widget.id, results.style).then(function (compiledCode) {
                    results.style = compiledCode;
                    d.resolve(results);
                });
                return d.promise;
            })
            .then(function (results) {
                extend(widget, results);
            });


        function compileStyle(id, source) {
            var d = $q.defer();
            assetsCompiler.compile('less', '#' + id + ' { ' + source + ' }', function (err, compiledCode) {
                if (err) {
                    console.error(err);
                }
                d.resolve(compiledCode);
            });
            return d.promise;
        }

    };
}
