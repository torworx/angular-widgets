function WidgetClass(data) {
    this.id = 'widget-' + id();
    this._initProperties(data);
}

WidgetClass.prototype._initProperties = function (data) {
    extend(this, data);
};

WidgetClass.prototype.initialize = function (options) {
    extend(this, options);
    this.afterInitialize();
};

WidgetClass.prototype.widgetize = function () {
    this._widgetize();
    this.afterWidgetize();
};

WidgetClass.prototype.afterInitialize = noop;
WidgetClass.prototype._widgetize = noop;
WidgetClass.prototype.afterWidgetize = noop;

WidgetClass.prototype.toObject = function () {
    return {};
};

WidgetClass.extend = function (data) {
    extend(WidgetClass.prototype, data);
};