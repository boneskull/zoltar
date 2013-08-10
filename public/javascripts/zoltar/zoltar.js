/*global angular, validator*/
(function () {
    'use strict';

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    var zoltar = angular.module('zoltar', [
        'zoltar.admin',
        'zoltar.common',
        'zoltar.index',
        'foundation',
        'ladda',
        'restangular',
        'socket.io'
    ]);

    zoltar.constant('zoltarConstants', {
        partialPath: '/partials/'
    });

    zoltar.config(function ($locationProvider, $routeProvider, $provide,
        zoltarSchemas, zoltarConstants) {
        var partialPath = zoltarConstants.partialPath,
            defaults = {
                now: function () {
                    return Date.now();
                },
                'false': function () {
                    return false;
                }
            },
            validators = {
                email: function (str) {
                    return validator.check(str).isEmail();
                },
                phone: function (str) {
                    return /^1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?(\d*))?$/.test(str);
                },
                ein: function (str) {
                    return /^\d{2}-\d{7}$/.test(str);
                }
            },
            assert = function assert(exp) {
                if (!exp) {
                    throw new Error("assertion failed");
                }
            };

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/admin', {
                templateUrl: partialPath + 'admin.html',
                controller: 'AdminCtrl'
            })
            .otherwise({
                templateUrl: 'main'
            });

        angular.forEach(zoltarSchemas, function (schema, name) {
            var model = function (o) {
                this.$schema = schema;
                this.$name = name;
                this.$defineProperties();
                angular.extend(this, o);
            };

            model.prototype.toString = function () {
                return angular.toJson(this);
            };

            model.prototype.$defineProperties = function () {
                var model = this;
                angular.forEach(this.$schema, function (definition, field) {
                    var simpleDefinition = angular.isString(definition),
                        type = simpleDefinition ? definition :
                            definition.type, val;
                    Object.defineProperty(model, field, {
                        enumerable: true,
                        configurable: true,
                        get: function () {
                            return val;
                        },
                        set: function (value) {
                            var _validator;
                            switch (type) {
                                case 'Date':
                                    assert(new Date(value).getTime() > 0);
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
