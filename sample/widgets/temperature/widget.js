define({
    name: 'Temperature',
    _widgetize: function() {
        var element = this.element;
        var temperature = element.find(".my_temperature .value");

        this.units = element.find(".my_temperature small");
        if (temperature.html() === "") {
            this.units.hide()
        } else {
            this.units.show();
        }
    },

    data: function (data) {
        this.element.find(".my_temperature .value").html(data.DA);
        this.units.show();
    }
});