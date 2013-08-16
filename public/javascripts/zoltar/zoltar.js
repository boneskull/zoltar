/*global angular, validator*/
(function () {
  'use strict';

  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }

  var zoltar = angular.module('zoltar', [
    'zoltarAdmin',
    'zoltarCommon',
    'zoltarIndex',
    'ladda',
    'ui.bootstrap',
    'restangular',
    'socketIO',
    'schemaForm',
    'placeholder'
  ]);

  zoltar.constant('zoltarConstants', {
    partialPath: '/partials/'
  });

  zoltar.run(function ($http, $cacheFactory) {
    $http.defaults.cache = $cacheFactory('zoltar');
  });

  zoltar.config(function ($locationProvider, $routeProvider, $provide, zoltarSchemas, zoltarConstants, $dialogProvider, $validatorProvider) {

    var partialPath = zoltarConstants.partialPath,
        defaults = {
          now: function () {
            return Date.now();
          },
          'false': function () {
            return false;
          },
          email: function () {
            return 'Email';
          }
        },
        validators = {
          email: function (str) {
            var validator = new window.Validator();
            try {
              validator.check(str).isEmail();
              return true;
            }
            catch (e) {
              return false;
            }
          },
          tel: function (str) {
            return /^1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?\.?\s+(\d*))?$/.test(str);
          },
          ein: function (str) {
            return /^\d{2}-?\d{7}$/.test(str);
          }
        },
        formatters = {
          ein: function (str) {
            if (!str) {
              return;
            }
            str = str.replace(/\D/g, '').trim();
            if (str.length === 9) {
              str = str.substring(0, 2) + '-' + str.substring(2);
            }
            return str;
          }
        },
        assert = function assert(exp) {
          if (!exp) {
            throw new Error("assertion failed");
          }
        };

    angular.forEach(validators, function (validator, name) {
      $validatorProvider.addValidator(name, validator);
    });

    angular.forEach(formatters, function (formatter, name) {
      $validatorProvider.addFormatter(name, formatter);
    });

    $locationProvider.html5Mode(true);

    $dialogProvider.options({dialogFade: true});

    $routeProvider
        .when('/admin', {
          templateUrl: partialPath + 'admin.html',
          controller: 'AdminCtrl'
        })
        .otherwise({
          templateUrl: 'main'
        });

    angular.forEach(zoltarSchemas, function (data, name) {
      var model = function (o) {
        this.$schema = data.schema;
        this.$metadata = data.metadata;
        this.$name = name;
        this.$defineProperties();
        angular.extend(this, o);
      };

      model.prototype.toString = function () {
        return angular.toJson(this);
      };

      model.getSchema = function () {
        return data.schema;
      };

      model.getMetadata = function () {
        return data.metadata;
      };

      model.prototype.$defineProperties = function () {
        var model = this;
        angular.forEach(this.$schema, function (definition, field) {
          var simpleDefinition = angular.isString(definition), val, type,
              arrayDefinition = angular.isArray(definition);
          if (simpleDefinition) {
            type = definition;
          }
          else {
            if (arrayDefinition) {
              definition = definition[0];
            }
            type = definition.type;
          }
          Object.defineProperty(model, field, {
            enumerable: true,
            configurable: true,
            get: function () {
              return val;
            },
            set: function (value) {
              var _validator;
              if (!angular.isDefined(value)) {
                val = value;
                return;
              }
              switch (type) {
                case 'Date':
                  assert(new Date(value).getTime() > 0);
                  break;
                case 'ObjectId':
                  break;
                case 'String':
                  if (angular.isDefined(definition.enum)) {
                    assert(definition.enum.indexOf(value) >=
                        0);
                  }
                  if (!!definition.trim) {
                    value = value.trim();
                  }
                /* falls through */
                default:
                  assert(Object.prototype.toString.call(value) ===
                      '[object ' + type + ']');
              }
              if (!simpleDefinition &&
                  angular.isDefined(definition.validator) &&
                  angular.isFunction(validators[definition.validator])) {
                _validator = validators[definition.validator];
                assert(_validator(value));
              }
              val = value;
            }
          });
          if (angular.isDefined(definition.default) &&
              angular.isFunction(defaults[definition.default])) {
            model[field] = defaults[definition.default]();
          }
        });
      };

      $provide.factory(name, function () {
        return model;
      });
    });
  });
})();
