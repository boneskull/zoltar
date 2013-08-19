/*global angular*/
(function () {
  "use strict";

  /**
   * @ngdoc service
   * @name zoltarCommon.service:Schema
   * @requires ng.$provide
   * @requires zoltar.object:zoltarSchemas
   * @requires zoltarCommon.service:$validator
   * @description
   * Creates a bunch of factories out of mongoose-gen-ish schema
   * definition files.
   * @constructor
   */
  angular.module('zoltarCommon').provider('Schema',
    function Schema($provide, zoltarSchemas, $validatorProvider) {

      /**
       * These provide default values for model properties.
       * @type {{now: Function, false: Function, email: Function}}
       */
      var defaults = {

          /**
           * Returns the current date timestamp w/ ms
           * @returns {number}
           */
          now: function () {
            return Date.now();
          },

          /**
           * Just returns false
           * @returns {boolean}
           */
          'false': function () {
            return false;
          },

          /**
           * Returns the string "Email"; used by a certain enum
           * @returns {string}
           */
          email: function () {
            return 'Email';
          }
        },

        /**
         * These provide validation functions for model properties.
         */
          validators = {

          /**
           * Asserts string is an email address
           * @param {string} str String to test
           * @returns {boolean} Success
           */
          email: function (str) {
            var validator = new window.Validator();
            try {
              validator.check(str).isEmail();
              return true;
            } catch (e) {
              return false;
            }
          },

          /**
           * Asserts string is a telephone number
           * @param {string} str String to test
           * @returns {boolean} Success
           */
          tel: function (str) {
            return /^1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?\.?\s+(\d*))?$/.test(str);
          },

          /**
           * Asserts string is a federal tax id (EIN)
           * @param {string} str String test
           * @returns {boolean} Success
           */
          ein: function (str) {
            return /^\d{2}-?\d{7}$/.test(str);
          }
        },

        /**
         * These provide formatters for model properties.  They are all
         * also turned into filters in the $validator provider.
         */
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

        /**
         * Handy-dandy assertion function.
         */
          assert = function assert(exp, msg) {
          if (!exp) {
            throw new Error(msg || "assertion failed");
          }
        };

      /**
       * @ngdoc method
       * @name zoltarCommon.service:Schema#init
       * @methodOf zoltarCommon.service:Schema
       * @description
       * Initializes the provider.  Actually creates a bunch of factories.
       */
      this.init = function init() {

        // add all the validators to the $validatorProvider
        angular.forEach(validators, function (validator, name) {
          $validatorProvider.addValidator(name, validator);
        });

        // add all the formatters to $validatorProvide
        angular.forEach(formatters, function (formatter, name) {
          $validatorProvider.addFormatter(name, formatter);
        });

        // for each schema found, create model pseudoclasses for them
        angular.forEach(zoltarSchemas, function (data, name) {
          var Model = function Model(o) {
            this.$schema = data.schema;
            this.$metadata = data.metadata;
            this.$name = name;
            this.$defineProperties();
            angular.extend(this, o);
          };

          /**
           * Returns the schema
           * @returns {Object} Schema definition
           */
          Model.getSchema = function () {
            return data.schema;
          };

          /**
           * Returns the metadata (generally form-specific settings)
           * @returns {Object} Metadta
           */
          Model.getMetadata = function () {
            return data.metadata;
          };

          Model.prototype.toString = function() {
            return JSON.stringify(this);
          };

          /**
           * Defines setters and getters for each of the model
           * properties.  These perform validation and trimming.
           * @todo Formatting?
           */
          Model.prototype.$defineProperties = function () {
            var model = this;
            angular.forEach(this.$schema, function (definition, field) {
              var simpleDefinition = angular.isString(definition), val, type, arrayDefinition = angular.isArray(definition);
              if (simpleDefinition) {
                type = definition;
              } else {
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
                  // validation here
                  switch (type) {
                    // assert we have a valid date.  getTime() will
                    // return 0 if invalid.
                    case 'Date':
                      assert(new Date(value).getTime() > 0, value + ' is a valid date');
                      break;

                    // ObjectIds are always strings, so assert we
                    // have a string
                    case 'ObjectId':
                      assert(angular.isObject(value) || angular.isString(value) ,value + ' is an object or an _id (string)');
                      break;

                    // if we have a string and it's an enum,
                    // assert the value is within the enum
                    case 'String':
                      if (angular.isArray(definition.enum)) {
                        assert(definition.enum.indexOf(value) >= 0, value + ' is within the enumeration ' + definition.enum);
                      }

                      // if we want to trim, trim.
                      if (!!definition.trim) {
                        value = value.trim();
                      }

                    // cast this thing to an object and assert whatever
                    // we have matches the type.  for example, a boolean
                    // value will be converted to a Boolean object,
                    // which matches the type "Boolean" in the schema.
                    /* falls through */
                    default:
                      assert(Object.prototype.toString.call(value) ===
                        '[object ' + type + ']', value + ' is of type ' + type);
                  }

                  // validate if we have defined a validator.
                  if (!simpleDefinition &&
                    angular.isDefined(definition.validator) &&
                    angular.isFunction(validators[definition.validator])) {
                    _validator = validators[definition.validator];
                    assert(_validator(value));
                  }
                  val = value;
                }
              });

              // set defaults by default.
              if (angular.isDefined(definition.default) &&
                angular.isFunction(defaults[definition.default])) {
                model[field] = defaults[definition.default]();
              }
            });
          };

          // turn this model into a factory with the same name
          $provide.factory(name, function () {
            return Model;
          });
        });
      };

      /**
       * @todo we have a provider, but it's not really providing a
       * factory anywhere.  All this provider does is create more
       * factories.
       * That suggests to me we should put this thing into a config()
       * somewhere, but this seems like quite a bit of code to just
       * mash into a config().
       */
      this.$get = function $get() {
        throw new Error('not implemented');
      };
    });

})();
