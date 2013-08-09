/*global angular*/

(function () {

    'use strict';

    var models = angular.module('zoltar.common.models');

    models.factory('Org', function () {

        var Org = function (o) {
            angular.extend(this, o);
        };

        return Org;
    });
})();
