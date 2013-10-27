function Widget( /* options, element */ ) {
}

Widget.prototype = {
    prefix: 'widget-',
    _init: function( options ) {
        this.id = this.prefix + id();
        angular.extend(this, options);
    },

    widgetize: function (scope, element) {
        console.log('widgetize');
    }
};