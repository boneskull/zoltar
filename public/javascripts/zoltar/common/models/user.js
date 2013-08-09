/*global angular*/

(function () {

    'use strict';

    var user = angular.module('zoltar.common.models.user', []);

    user.factory('User', function () {

        var User = function (o) {
            angular.extend(this, o);
        };

        return User;
    });
})();
