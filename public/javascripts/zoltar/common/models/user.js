/*global angular*/

(function () {

    'use strict';

    var models = angular.module('zoltar.common.models');

    models.factory('User', function () {

        var User = function (o) {
            angular.extend(this, o);
        };

        return User;
    });
})();
