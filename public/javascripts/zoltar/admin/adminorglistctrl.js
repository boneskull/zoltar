/*global angular*/
(function () {
  'use strict';


  /**
   * @ngdoc controller
   * @name zoltarAdmin.controller:AdminOrgListCtrl
   * @requires ng.$rootScope:Scope
   * @requires socket.service:socket
   * @requires zoltar.service:Org
   * @requires ui.bootstrap.service:$dialog
   * @requires zoltar.object:zoltarConstants
   * @description
   * Handles the Org list.
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminOrgListCtrl',
    function AdminOrgListCtrl($scope, socket, Org, $dialog, zoltarConstants,
      $cacheFactory) {

      var PAGE_LENGTH = zoltarConstants.pageLength, objectCache = $cacheFactory.get('objects');

      var onAdminOrglist = function onAdminOrglist(orglist) {
        objectCache.put('orgs', orglist.map(function (org) {
          return new Org(org);
        }));
        $scope.orglist = objectCache.get('orgs');

        $scope.noOfPages = Math.ceil($scope.orglist.length / PAGE_LENGTH);
        $scope.currentPage = $scope.currentPage || 1;
      };

      /**
       *
       */
      $scope.openAddOrgDialog = function openAddOrgDialog() {
        $dialog.dialog({templateUrl: 'addOrg', controller: 'AdminAddOrgCtrl', dialogClass: 'addOrgModal modal'}).open();

      };

      socket.on('admin:orglist', onAdminOrglist);
    });
})();
