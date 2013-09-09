/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name zolta
   * rAdmin.controller:AdminOrgListCtrl
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
    function AdminOrgListCtrl($scope, socket, Org, $modal, zoltarConstants,
      $cacheFactory, $controller) {

      var objectCache = $cacheFactory.get('objects'),
        onAdminOrglist = function onAdminOrglist(orglist) {
          objectCache.put('orgs', orglist.map(function (org) {
            return  new Org(org);
          }));
          $scope.orglist = objectCache.get('orgs') || [];

          $controller('ListMixinCtrl', {
            $scope: $scope,
            config: {
              list: $scope.orglist
            }
          });

        };

      $scope.openConfirmDeleteOrgDialog =
        function openConfirmDeleteOrgDialog(org) {
//          $dialog.messageBox('Confirm Delete Organization',
//              'Are you sure you want to delete organization "' + org.name +
//                '"?',
//              [
//                {
//                  label: 'Cancel'
//                },
//                {
//                  label: 'Delete',
//                  result: 'delete',
//                  cssClass: 'btn-danger'
//                }
//              ]
//            ).open()
//            .then(function (result) {
//              if (result === 'delete') {
//                socket.emit('admin:deleteOrg', org);
//              }
//            });
        };

      /**
       *
       */
      $scope.openAddOrgDialog = function openAddOrgDialog() {
//        $dialog.dialog(
//          {
//            templateUrl: 'addOrg',
//            controller: 'AdminAddOrgCtrl',
//            dialogClass: 'orgModal modal'
//          }).open();
      };

      /**
       *
       * @param org
       * @private
       */
      $scope._openViewOrgDialog = function (org) {
        $scope.tmp.viewOrg = org;
        $scope.tmp.editOrg = angular.copy(org);

//        $dialog.dialog(
//          {
//            templateUrl: 'viewOrg',
//            controller: 'AdminEditOrgCtrl',
//            dialogClass: 'orgModal modal',
//            resolve: {
//              tmp: function () {
//                return $scope.tmp;
//              }, toggles: function () {
//                return $scope.toggles;
//              }
//            }
//          }).open()
//          .then($scope._onViewEditOrgDialogClose);

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
