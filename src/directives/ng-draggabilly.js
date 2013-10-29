$DraggabillyDirective.$inject = ['$rootScope'];
function $DraggabillyDirective($rootScope) {

    var debugDrag = debug("widgets:draggabilly");

    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {

            var draggie = null;

            var dragInit = function() {
                draggie = new Draggabilly(element[0], {
                    handle: '.drag-handle'
                });

                draggie.on('dragEnd', function(draggieInstance, event, pointer) {
                });

            };


            var mediaQuery = "screen and (min-width: 480px)";
            enquire.register(mediaQuery, {

                match: function() {
                    // SETUP PACKERY
                    draggie.enable();
                    debugDrag("Matched");
                },

                unmatch: function() {
                    // DISABLE PACKERY
                    draggie.disable();
                    debugDrag("Unmatched");
                },

                deferSetup: false,

                setup: function() {
                    dragInit();
                    debugDrag("Setup");
                    if (!enquire.queries[mediaQuery].mql.matches) {
                        draggie.disable();
                    }
                }

            });


            $rootScope.$broadcast('!draggabilly', draggie);

            $rootScope.$on('!undraggable', function() {
                draggie.disable();
            });

            $rootScope.$on('!draggable', function() {
                draggie.enable();
            })


        }
    }
}

angular.module('widgets.directives').directive('ngDraggabilly', $DraggabillyDirective);