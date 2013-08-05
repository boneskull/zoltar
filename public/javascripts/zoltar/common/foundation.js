/*global angular, $*/
(function () {
    'use strict';

    angular.module('foundation', []).run(function ($document) {
        $($document[0]).foundation();
    });

})();