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
      $cacheFactory, $controller) {

      var objectCache = $cacheFactory.get('objects'),
        onAdminOrglist = function onAdminOrglist(orglist) {
          objectCache.put('orgs', orglist.map(function (org) {
            return new Org(org);
          }));
          $scope.orglist = objectCache.get('orgs');

          $controller('ListMixinCtrl', {
            $scope: $scope,
            config: function() {
              return {
                list: $scope.orglist
              };
            }
          });

        };

      /**
       *
       */
      $scope.openAddOrgDialog = function openAddOrgDialog() {
        $dialog.dialog(
          {
            templateUrl: 'addOrg',
            controller: 'AdminAddOrgCtrl',
            dialogClass: 'addOrgModal modal'
          }).open();
      };

      /**
       *
       * @param org
       * @private
       */
      $scope._openViewOrgDialog = function (org) {
        $scope.tmp.viewOrg = org;
        $scope.tmp.editOrg = angular.copy(org);

        $dialog.dialog(
          {
            templateUrl: 'viewOrg',
            controller: 'AdminEditOrgCtrl',
            resolve: {
              tmp: function () {
                return $scope.tmp;
              }, toggles: function () {
                return $scope.toggles;
              }
            }
          }).open()
          .then($scope._onViewEditOrgDialogClose);

      };

      /**
       *
       * @param org
       */
      $scope.openViewOrgDialog = function (org) {
        $scope.toggles.orgEditMode = false;
        $scope._openViewOrgDialog(org);
      };

      /**
       *
       * @param org
       */
      $scope.openEditOrgDialog = function (org) {
        $scope.toggles.orgEditMode = true;
        $scope._openViewOrgDialog(org);
      };

      socket.on('admin:orglist', onAdminOrglist);
    });
})();
