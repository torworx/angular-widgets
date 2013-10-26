describe('services', function () {

    describe('widgetsProvider', function () {
        var $httpBackend,
            $rootScope,
            $widgets,
            helper,
            Local, Remote;

        beforeEach(module('widgets', function ($widgetsProvider) {
            $widgetsProvider.define('local', {name: 'Local'});
            $widgetsProvider.load('remote', '/remote');
        }));

        beforeEach(inject(function (_$rootScope_, _$httpBackend_) {
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            $httpBackend.when('GET', '/remote/widget.js').respond(
                'define({' +
                    'name: "Remote",' +
                    'custom: function () {},' +
                    'widgetize: function () {}' +
                 '});'
            );

            $httpBackend.when('GET', '/remote/style.less').respond(
                '.title {' +
                    'color: red;' +
                '}'
            );

            $httpBackend.when('GET', '/remote/view.html').respond(
                '<div class="title">Remote Widget</div>'
            );

            helper = new Helper($rootScope);
        }));

        beforeEach(inject(function (_$widgets_) {
            $widgets = _$widgets_;
            $httpBackend.flush();
            helper.waitsForPromise($widgets.ready, function () {
                Local = $widgets.definitions[0];
                Remote = $widgets.definitions[1];
            });
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should initiate $widgets', function () {
            expect($widgets).toBeTruthy();
            expect($widgets.definitions.length).toBe(2);

            expect(Local.widgetName).toBe('local');
            expect(Remote.widgetName).toBe('remote');
            expect(Remote.prototype.custom).toBeTruthy();
        });

        it('should initiate local widget', function () {
            var widget = new Local({}, angular.element('<div></div>'));
            expect(widget.name).toBe('Local');
        });

        it('should initiate remote widget', function () {
            var widget, promise;
            widget = new Remote({}, angular.element('<div></div>'));
            expect(widget.name).toBe('Remote');
            expect(widget.view).toBeUndefined();
            expect(widget.style).toBeUndefined();

            promise = widget.loadRes();
            expect(promise).toBeTruthy();
            $httpBackend.flush();

            helper.waitsForPromise(promise, function () {
                expect(widget.view).toBeTruthy();
                expect(widget.style).toBeTruthy();
            });
        });
    });

});