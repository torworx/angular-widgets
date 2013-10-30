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
