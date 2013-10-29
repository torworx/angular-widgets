$PackeryDirective.$inject = ['$rootScope', '$timeout'];
function $PackeryDirective($rootScope, $timeout) {

    var packery, packeryLoaded;

    var debugPackery = debug("widgets:packery");
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            function packeryInit() {
                debugPackery('init');

                packery = new Packery(element[0], {
                    itemSelector: attrs.ngPackery,
                    columnWidth: 250,
                    rowHeight: 210,
                    gutter: 20,
                    isInitLayout: false
                });
            }

            function packeryRefresh() {
                if (packery) {
                    debugPackery("Refreshing");
                    packery.reloadItems();
                    packery.layout();

                    debugPackery(element.find(attrs.ngPackery).length);

                    element.find(attrs.ngPackery).css({
                        opacity: 1
                    });
                }
            }

            function packeryRelease() {

                if (packery && packery.destroy) {
                    debugPackery("Destroy");
                    packery.destroy();
//                    packery = null;
                }
                packery = null;

                // Reset element CSS
                element.find(attrs.ngPackery).css({
                    top: 'auto', left: 'auto', position: 'relative', opacity: 1
                });
            }

            function forceShowItems() {
                $timeout(function() {
                    element.find(attrs.ngPackery).css({
                        opacity: 1
                    });
                }, 0)
            }

            // SCREEN MEDIA QUERIES
            var mediaQuery = "screen and (min-width: 480px)";
            enquire.register(mediaQuery, {

                match: function() {
                    debugPackery("matched");
                    // SETUP PACKERY
                    packeryInit();
                    packeryRefresh();
                    $rootScope.$broadcast("!draggable");
                },

                unmatch: function() {
                    $timeout(function() {
                        // DISABLE PACKERY
                        packeryRelease();
                        // forceShowItems();
                        debugPackery("Unmatched");
                        element.find(attrs.packery).css({
                            top: '', left: '', position: '', opacity: 1
                        });
                        $rootScope.$broadcast("!undraggable");
                    }, 100)
                },

                deferSetup: false,

                setup: function() {

                    debugPackery("Setup");
                    if (enquire.queries[mediaQuery].mql.matches) {
                        packeryInit();
                    } else {
                        forceShowItems();
                        $rootScope.$broadcast("!undraggable");
                    }
                }
            });

            $rootScope.$on("!widgetsLoaded", function(event, widgets) {
                if (enquire.queries[mediaQuery].mql.matches) {
                    packeryRefresh();
                } else {
                    forceShowItems();
                }

            });

            $rootScope.$on("!draggabilly", function(event, draggie) {
                if (packery) {
                    packery.bindDraggabillyEvents(draggie);
                }
            });

            $rootScope.$on("!doLayout", function(event) {
                $timeout(function() {
                    packeryRefresh();
                }, 500)
            });

            $rootScope.$on("!packeryDestory", function(event) {
                packeryRelease();
            });
        }
    }
}

angular.module('widgets.directives').directive('ngPackery', $PackeryDirective);