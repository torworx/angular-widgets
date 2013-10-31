$PackeryDirective.$inject = ['$rootScope', '$timeout'];
function $PackeryDirective($rootScope, $timeout) {

    var packery;

    var debugPackery = debug("ngw:packery");
    return {
        restrict: 'A',
        link: function postLink($scope, element, attrs) {
            function packeryInit() {
                debugPackery('init');

                packery = new Packery(element[0], {
                    itemSelector: attrs.ngwPackery,
                    columnWidth: 250,
                    rowHeight: 210,
                    gutter: 20,
                    isInitLayout: false
                });

                // LAYOUT COMPLETE
                packery.on('layoutComplete', function(packery, items) {
                    // debugPackery("Packery Layout Complete", packery, items);
                });

                packery.on('dragItemPositioned', function(packery, draggedItem) {
                    debugPackery("widgets order changed");

                    if (!$scope.$$phase) {
                        $scope.$apply(function() {

                            var newItems = packery.items;
                            var ids = [];
                            forEach(newItems, function (item) {
                                ids.push(item.element.id);
                            });

                            $rootScope.$broadcast(':widgetsReordered', ids);


//                            var widgetIds = _.map(newItems, function(item) { return item.element.id; });
//
//                            _.each(widgetIds, function(id, index) {
//                                var widget = _.find(NBUser.DashboardSettings.Widgets, function(widget) { return widget.id === id; });
//                                widget.settings.sortOrder = index;
//                            });

                            // Update the Dashboard Widgets sort order
//                            NBUser.DashboardSettings.Widgets = _.sortBy(NBUser.DashboardSettings.Widgets, function(widget) { return widget.settings.sortOrder; });
//                            NBUser.SavePreferences();

                        });
                    }

                    $rootScope.$broadcast(':widgetsOrderUpdated', draggedItem);
                })
            }

            function packeryRefresh() {
                if (packery) {
                    debugPackery("refreshing");
                    packery.reloadItems();
                    packery.layout();

                    element.find(attrs.ngwPackery).css({
                        opacity: 1
                    });
                }
            }

            function packeryRelease() {

                if (packery && packery.destroy) {
                    debugPackery("destroy");
                    packery.destroy();
                }
                packery = null;

                // Reset element CSS
                element.find(attrs.ngwPackery).css({
                    top: 'auto', left: 'auto', position: 'relative', opacity: 1
                });
            }

            function forceShowItems() {
                $timeout(function() {
                    element.find(attrs.ngwPackery).css({
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
                    $rootScope.$broadcast(":draggable");
                },

                unmatch: function() {
                    $timeout(function() {
                        // DISABLE PACKERY
                        packeryRelease();
                        // forceShowItems();
                        debugPackery("unmatched");
                        element.find(attrs.ngwPackery).css({
                            top: '', left: '', position: 'relative', opacity: 1
                        });
                        $rootScope.$broadcast(":undraggable");
                    }, 100)
                },

                deferSetup: false,

                setup: function() {

                    debugPackery("setup");
                    if (enquire.queries[mediaQuery].mql.matches) {
                        packeryInit();
                    } else {
                        forceShowItems();
                        $rootScope.$broadcast(":undraggable");
                    }
                }
            });

            $rootScope.$on(":widgetsLoaded", function(event, widgets) {
                if (enquire.queries[mediaQuery].mql.matches) {
                    packeryRefresh();
                } else {
                    forceShowItems();
                }

            });

            $rootScope.$on(":draggabilly", function(event, draggie) {
                if (packery) {
                    packery.bindDraggabillyEvents(draggie);
                }
            });

            $rootScope.$on(":layoutChanged", function(event) {
                $timeout(function() {
                    packeryRefresh();
                }, 500)
            });

            $rootScope.$on(":packeryDestroy", function(event) {
                packeryRelease();
            });
        }
    }
}

angular.module('widgets.directives').directive('ngwPackery', $PackeryDirective);