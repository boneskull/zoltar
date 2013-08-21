/*global angular, _*/
(function () {
  "use strict";

  /**
   * Certain HTML5 field types validate things incorrectly; this probably
   * changes browser-to-browser.  For example, "email" does not validate
   * email properly (allows "foo@bar")
   * @type {Array}
   */
  var types = [
    'button', 'checkbox', 'color', 'date', 'datetime', 'datetime-local', 'file',
    'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset',
    'search', 'submit', 'text', 'time', 'url', 'week'
  ];

  var schemaForm = angular.module('schemaForm', []);

  /**
   * @ngdoc service
   * @name schemaForm.service:$validatorProvider
   * @requires ng.$filterProvider
   * @description
   * Stores validators and formatters for validating and formatting
   * generated forms.
   */
  schemaForm.provider('$validator', function $validator($filterProvider) {

    this._validators = {};
    this._formatters = {};

    /**
     * @ngdoc method
     * @name schemaForm.service:$validatorProvider#addValidator
     * @methodOf schemaForm.service:$validatorProvider
     * @param {string} name Name of validator
     * @param {function()} fn Validator function
     * @description
     * Adds a validator to the lookup object
     */
    this.addValidator = function (name, fn) {
      this._validators[name] = fn;
    };

    /**
     * @ngdoc method
     * @name schemaForm.service:$validatorProvider#addFormatter
     * @methodOf schemaForm.service:$validatorProvider
     * @param {string} name Name of formatter
     * @param {function()} fn Formatter function
     * @description
     * Adds a formatter to the lookup object.  As a bonus, registers
     * a filter with the same name.
     */
    this.addFormatter = function (name, fn) {
      this._formatters[name] = fn;
      $filterProvider.register(name, function () {
        return fn;
      });
    };

    /**
     * @ngdoc service
     * @name schemaForm.service:$validator
     * @description
     * Exposes validation/formatting functions based on registered
     * validators and formatters.
     */
    this.$get = function () {
      var validators = this._validators, formatters = this._formatters;
      return {

        /**
         * @ngdoc method
         * @name schemaForm.service:$validator#validate
         * @methodOf schemaForm.service:$validator
         * @param {string} validator Validator name
         * @param {string} str String to validate
         * @returns {boolean} Success
         */
        validate: function (validator, str) {
          if (!validators[validator]) {
            return true;
          }
          return validators[validator].call(this, str);
        },

        /**
         * @ngdoc method
         * @name schemaForm.sevice:$validator#format
         * @methodOf schemaForm.service:$validator
         * @param {string} formatter Name of formatter
         * @param {string} str String to format
         * @returns {string} Formatted string
         */
        format: function (formatter, str) {
          if (!formatters[formatter]) {
            return str;
          }
          return formatters[formatter].call(this, str);
        }
      };
    };
  });

  schemaForm.directive('schemaForm',
    function schemaFormDirective($injector, Restangular, $cacheFactory) {
      return {
        restrict: 'E',
        scope: {
          legend: '=',
          formName: '@',
          schemaName: '@',
          model: '=',
          readOnly: '='
        },
        replace: true,
        transclude: true,
        templateUrl: '/partials/schemaform.html',
        link: function postLink(scope) {
          var model = $injector.get(scope.schemaName),
            schema = model.getSchema(),
            metadata = model.getMetadata(),
            orderedSchema = [],
            Ref,
            resource,
            refWatches = {},
            objectCache = $cacheFactory.get('objects'),
            plural,
            cachedData;

          scope.refData = {};
          scope.refSchema = {};
          scope.refMetadata = {};

          angular.forEach(schema, function (def, field) {
            // correct the schema for form FIELD: TYPE
            // when we really want FIELD: {type: TYPE}
            if (angular.isString(def)) {
              schema[field] = {
                type: def
              };
            }

            if (angular.isArray(def)) {
              def = def[0];
              def.$multiple = true;
            } else {
              def.$multiple = false;
            }

            // set the placeholder
            if (angular.isDefined(metadata.placeholders) &&
              metadata.placeholders[field]) {
              def.$placeholder = metadata.placeholders[field];
            } else {
              def.$placeholder = def.title ? def.title : field;
            }

            if (!def.ref) {
              // handle native fields
              def.$type = 'text';
              // TODO: remove crap from the types array when we find out
              // it's broken, like 'email' and 'tel' are.
              if (angular.isDefined(def.validate) &&
                types.indexOf(def.validate) >= 0) {
                def.$type = def.validate;
              }
            } else {
              // handle references. gather data from the server.
              Ref = $injector.get(def.ref);
              plural = def.ref.toLowerCase() + 's';
              scope.refSchema[def.ref] = Ref.getSchema();
              scope.refMetadata[def.ref] = Ref.getMetadata();
              cachedData = objectCache.get(plural);
              if (angular.isDefined(cachedData)) {
                scope.refData[def.ref] = cachedData;
              } else {
                resource = Restangular.all(plural);
                resource.getList().then(function (items) {
                  items = items.map(function (item) {
                    return new Ref(item);
                  });
                  objectCache.put(items.route, items);
                  scope.refData[def.ref] = objectCache.get(items.route);
                });
              }
              // clear watch
              if (angular.isFunction(refWatches[plural])) {
                refWatches[plural]();
              }
              // set up new watch
              refWatches[plural] = scope.$watch(function () {
                return objectCache.get(plural);
              }, function (newval, oldval) {
                if (newval !== oldval) {
                  scope.refData[def.ref] = newval;
                }
              }, true);
            }
          });

          if (angular.isDefined(metadata) &&
            angular.isDefined(metadata.order)) {
            orderedSchema = metadata.order.map(function (field) {
              return {
                field: field,
                def: angular.isArray(schema[field]) ? schema[field][0] :
                  schema[field]
              };
            });
          } else {
            orderedSchema = _.map(schema, function (def, field) {
              return {
                field: field,
                def: angular.isArray(def) ? def[0] : def
              };
            });
            if (metadata.hidden) {
              orderedSchema = orderedSchema.filter(function (prop) {
                return metadata.hidden.indexOf(prop.field) === -1;
              });
            }
          }

          scope.schema = orderedSchema;

          scope.$parent.schemaForm = scope.schemaForm;
        }
      };
    });

  schemaForm.directive('validate', function validateDirective($validator) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var type = scope.$eval(attrs.validate);
        if (type) {
          ngModel.$parsers.unshift(function (viewValue) {
            var valid = true;
            if (viewValue || attrs.required) {
              valid =
                $validator.validate(type, $validator.format(type, viewValue));
            }
            ngModel.$setValidity(attrs.id, valid);
            if (valid) {
              ngModel.$render();
              return viewValue;
            }
          });
          ngModel.$formatters.push(function (viewValue) {
            return $validator.format(type, viewValue);
          });
          ngModel.$render = function () {
            var formatted = $validator.format(type, ngModel.$viewValue);
            if (angular.isDefined(formatted)) {
              element.val(formatted);
            }
          };
        }
      }
    };
  });

})();
