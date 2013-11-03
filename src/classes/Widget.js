function WidgetClass(data) {
    this.id = 'widget-' + id();
    this._initProperties(data);
}

WidgetClass.prototype._initProperties = function (data) {
    extend(this, data);
};

WidgetClass.prototype.run = function (options) {
    extend(this, options);
    this.beforeWidgetize();
    this.widgetize();
    this.afterWidgetize();
};

WidgetClass.prototype.beforeWidgetize = noop;
WidgetClass.prototype.widgetize = noop;
WidgetClass.prototype.afterWidgetize = noop;

WidgetClass.prototype.toObject = function () {
    return {};
};

WidgetClass.extend = function (data) {
    extend(WidgetClass.prototype, data);
};