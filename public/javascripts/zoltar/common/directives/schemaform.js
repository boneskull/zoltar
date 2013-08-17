/*global angular*/
(function () {
  "use strict";

  var types = [
    'button',
    'checkbox',
    'color',
    'date',
    'datetime',
    'datetime-local',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'text',
    'time',
    'url',
    'week'
  ];

  var schemaForm = angular.module('schemaForm', []);

  var schemaFormDirective = function schemaFormDirective($injector, Restangular) {
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
          link: function postLink(scope, element, attrs) {
            var model = $injector.get(scope.schemaName),
                schema = model.getSchema(),
                metadata = model.getMetadata(),
                orderedSchema = [], Ref, resource;
scope.alert = function() {
  alert('hi');
};
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
                def.$placeholder = metadata.placeholders[field]
              } else {
                def.$placeholder = def.title ? def.title : field;
              }

              if (!def.ref) {
                // handle native fields
                def.$type = 'text';
                if (angular.isDefined(def.validate)) {
                  if (types.indexOf(def.validate) === -1) {
                    // TODO: use this for validation
                    def.$pattern = def.validate;
                  } else {
                    def.$type = def.validate;
                  }
                }
              } else {
                // handle references. gahter data from the server.
                Ref = $injector.get(def.ref);
                scope.refSchema[def.ref] = Ref.getSchema();
                scope.refMetadata[def.ref] = Ref.getMetadata();
                resource = Restangular.all(def.ref.toLowerCase() + 's');
                resource.getList().then(function (items) {
                  scope.refData[def.ref] = items.map(function (item) {
                    return new Ref(item);
                  });
                });
              }
            });

            if (angular.isDefined(metadata) &&
                angular.isDefined(metadata.order)) {
              orderedSchema = metadata.order.map(function (field) {
                    return {
                      field: field,
                      def: angular.isArray(schema[field]) ? schema[field][0] : schema[field]
                    }
                  }
              )
              ;
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
        }
      }
      ;

  var validateDirective = function validateDirective($validator) {
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
  };

  var $validator = function $validator() {

    this._validators = {};
    this._formatters = {};

    this.addValidator = function (name, fn) {
      this._validators[name] = fn;
    };

    this.addFormatter = function (name, fn) {
      this._formatters[name] = fn;
    };

    this.$get = function () {
      var validators = this._validators,
          formatters = this._formatters;
      return {
        validate: function (validator, str) {
          if (!validators[validator]) {
            return true;
          }
          return validators[validator].call(this, str);
        },
        format: function (formatter, str) {
          if (!formatters[formatter]) {
            return str;
          }
          return formatters[formatter].call(this, str);
        }
      };

    };
  };

  schemaForm.provider('$validator', $validator);
  schemaForm.directive('schemaForm', schemaFormDirective);
  schemaForm.directive('validate', validateDirective);

})();
