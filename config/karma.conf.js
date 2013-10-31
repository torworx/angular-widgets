module.exports = function (config) {
    config.set({

        basePath: '../',

        frameworks: ["jasmine"],

        files: [
            // 3rd-party code
            'components/jquery/jquery.js',
            'components/less.js/dist/less-1.5.0.js',
            'components/angular/angular.js',
            'components/angular-mocks/angular-mocks.js',

            // App code
            '../release/angular-widgets.debug.js',

            // Test helper
            'test/helper.js',

            // Test specs
            'test/**/*.test.js'
        ],

        // list of files to exclude
        exclude: [],

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: 'dots' || 'progress'
        reporter: 'dots',

        // these are default values, just to show available options

        // web server port
        port: 8080,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // polling interval in ms (ignored on OS that support inotify)
        autoWatchInterval: 0,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari
        // - PhantomJS
        browsers: [ 'Chrome' ]
    })
};