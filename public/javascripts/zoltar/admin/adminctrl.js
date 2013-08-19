/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name zoltarAdmin.controller:AdminCtrl
   * @description
   * Parent controller for the admin console.  Provides toggles and a place
   * to put various temporary variables.
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminCtrl',
    function AdminCtrl($scope) {

      /**
       * @ngdoc property
       * @name zoltarAdmin.controller:AdminCtrl#tmp
       * @propertyOf zoltarAdmin.controller:AdminCtrl
       * @type {{}}
       * @description
       * Temporary variables go here.  User to view, edit, delete, add, etc.
       */
      $scope.tmp = {};

      /**
       * @ngdoc property
       * @name zoltarAdmin.controller:AdminCtrl#toggles
       * @propertyOf zoltarAdmin.controller:AdminCtrl
       * @description
       * Various view-wide toggles go in here.
       * @type {{userEditMode: boolean}}
       */
      $scope.toggles = {
        userEditMode: false
      };

    });

})();
