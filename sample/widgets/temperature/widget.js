define({
    name: 'Temperature'
},{
    _widgetize: function() {
        var element = this.element;
        var temperature = element.find(".my_temperature .value");

        var units = element.find(".my_temperature small");
        if (temperature.html() === "") {
            units.hide()
        } else {
            units.show();
        }

        this.onData = function (data) {
            temperature.html(data.DA);
            units.show();
        }
    }
});