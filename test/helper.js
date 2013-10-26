function Helper($rootScope) {

    this.waitsForPromise = function (promise, callback) {
        var resolved;
        runs(function () {
            promise.then(function () {
                resolved = true;
            });
            $rootScope.$apply();
        });

        waitsFor(function () {
            return resolved;
        });

        if (callback) runs(callback);
    };
}

