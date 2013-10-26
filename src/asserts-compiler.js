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