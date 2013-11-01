$DraggabillyDirective.$inject = ['$rootScope'];
function $DraggabillyDirective($rootScope) {

    var debugDrag = debug("ngw:draggabilly");

    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {

            var draggie = null;

            var dragInit = function() {
                draggie = new Draggabilly(element[0], {
                    handle: '.drag-handle'
                });

                draggie.on('dragEnd', function(draggieInstance, event, pointer) {
                    debugDrag('drag end');
                });
            };


            var mediaQuery = "screen and (min-width: 480px)";
            enquire.register(mediaQuery, {

                match: function() {
                    // SETUP PACKERY
                    draggie.enable();
                    debugDrag("matched");
                },

                unmatch: function() {
                    // DISABLE PACKERY
                    draggie.disable();
                    debugDrag("unmatched");
                },

                deferSetup: false,

                setup: function() {
                    dragInit();
                    debugDrag("setup");
                    if (!enquire.queries[mediaQuery].mql.matches) {
                        draggie.disable();
                    }
                }

            });

            $rootScope.$broadcast(':draggabilly', draggie);

            $rootScope.$on(':undraggable', function() {
                draggie.disable();
            });

            $rootScope.$on(':draggable', function() {
                draggie.enable();
            })
        }
    }
}

angular.module('ng.widgets.directives').directive('ngwDraggabilly', $DraggabillyDirective);