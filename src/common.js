/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var idSeed = 0,
    isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy,
    toJson = angular.toJson;

function id() {
    return idSeed++;
}

function inherit(parent, extra) {
    return extend(new (extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
    forEach(arguments, function(obj) {
        if (obj !== dst) {
            forEach(obj, function(value, key) {
                if (!dst.hasOwnProperty(key)) dst[key] = value;
            });
        }
    });
    return dst;
}

/**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
function ancestors(first, second) {
    var path = [];

    for (var n in first.path) {
        if (first.path[n] === "") continue;
        if (!second.path[n]) break;
        path.push(first.path[n]);
    }
    return path;
}

angular.module('widgets.directives', []);
angular.module('widgets.services', []);
angular.module('widgets', ['widgets.directives', 'widgets.services']);