function Widget(options) {}

Widget.prototype = {
    prefix: 'widget-',
    _create: function( options ) {
        this.id = this.prefix + id();
        extend(this, options);
    },

    _initialize: function (scope, element) {
        this.scope = scope;
        this.element = element;
        this._widgetize();
    },

    _widgetize: noop,

    data: function (data) {
        // noop
    }
};