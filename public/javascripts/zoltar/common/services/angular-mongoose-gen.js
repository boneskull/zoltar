/*global angular, validator*/
(function () {
    "use strict";

    angular.module('zoltar.common.services', []).config(
        function ($provide, zoltarSchemas) {

            var defaults = {
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
                    }
                }, models = {};

            angular.forEach(zoltarSchemas, function (schema, name) {
                var model = models[name] = function (o) {
                    angular.extend(this, this._validate(o),
                        this._getDefaults());
                };

                model.prototype._schema = schema;

                model.prototype._getDefaults = function () {
                    var o = {};
                    angular.forEach(this._schema,
                        function (definition, field) {
                            if (angular.isDefined(definition.default)) {
                                o[field] =
                                    defaults[definition.default].call(this);
                            }
                        });
                    return o;
                };

                model.prototype._validate = function (o) {
                    var that = this;
                    angular.forEach(o, function (value, field) {
                        var _validator;
                        if (angular.isDefined(that._schema[field])) {
                            _validator = that._schema[field].validator;
                            if (angular.isDefined(_validator)
                                &&
                                angular.isFunction(validators[_validator])) {
                                if (!validators[_validator](value)) {
                                    throw new Error(field +
                                        ' failed valiation with value "' +
                                        value + '" against validator "' +
                                        _validator + '"');
                                }
                            }
                        }
                    });
                    return o;
                };

                $provide.factory(name, function () {
                    return model;
                });
            });

        });
})();
