define({
    name: 'RGB Color Wheel'
}, {
    bodyCls: 'view',
    widgetize: function() {
        var scope = this.scope;
        var element = this.element;

        // FUNCTIONS
        function drawColorWheel(canvas, outsideRadius, insideRadius, colors) {
            var startAngle = -19;
            var arc = Math.PI / (colors.length/2);
            var ctx;

            if (canvas.getContext) {

                // debugger;
                ctx = canvas.getContext("2d");

                ctx.clearRect(0,0,canvas.width,canvas.height);

                ctx.strokeStyle = "#333";
                ctx.lineWidth = 2;

                for(var i = 0; i < colors.length; i++) {
                    var angle = startAngle + i * arc;
                    ctx.fillStyle = colors[i];

                    ctx.beginPath();
                    ctx.arc(canvas.width/2, canvas.height/2, outsideRadius, angle, angle + arc, false);
                    ctx.arc(canvas.width/2, canvas.height/2, insideRadius, angle + arc, angle, true);
                    ctx.stroke();
                    ctx.fill();
                }
            } else {
                // console.log("No context");
            }
        }

        function generateColorArray(numColors) {
            var colorArray = [];

            var startingHue = 0;
            var colorInterval = 360 / numColors;
            for (var i=0; i<numColors; i++) {
                var hue = startingHue + (i * colorInterval);
                var color = 'hsl(' + hue + ', 100%, 50%)';
                colorArray.push(color);
            }

            return colorArray;
        }

        function findPos(obj) {
            var curleft = 0, curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return { x: curleft, y: curtop };
            }
            return undefined;
        }

        function rgbToHex(r, g, b) {
            if (r > 255 || g > 255 || b > 255)
                throw "Invalid color component";
            return ((r << 16) | (g << 8) | b).toString(16);
        }


        // INIT
        var view = $(element);
        var colorwheel = view.find(".colorPicker");
        var colors = generateColorArray(16);
        colors.push("#FFFFFF");
        colors.push("#000000");

        // DRAW COLOR WHEEL
        drawColorWheel(colorwheel[0], 70, 40, colors);


        // RECEIVING DEVICE DATA
        this.onData = function(data) {
            $(element).find(".currentcolor").css({
                backgroundColor: "#" + data.DA
            });
        };

    }
});