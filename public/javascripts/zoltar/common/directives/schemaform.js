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
        'email',
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
        'tel',
        'text',
        'time',
        'url',
        'week'
    ];

    angular.module('schemaForm', []).directive('schemaForm',
        function ($injector) {
            return {
                restrict: 'E',
                scope: {
                    legend: '=',
                    formName: '@',
                    schemaName: '@',
                    model: '='
                },
                replace: true,
                templateUrl: '/partials/schemaform.html',
                link: function postLink(scope, element, attrs) {
                    var model = $injector.get(scope.schemaName),
                        schema = model.getSchema(),
                        metadata = model.getMetadata(),
                        orderedSchema = [];
                    angular.forEach(schema, function (def, field) {
                        // correct the schema for form FIELD: TYPE
                        // when we really want FIELD: {type: TYPE}
                        if (angular.isString(def)) {
                            schema[field] = {
                                type: def
                            };
                        }
                        def.$type = 'text';
                        if (angular.isDefined(def.validate)) {
                            if (types.indexOf(def.validate) === -1) {
                                def.$pattern = def.validate;
                            } else {
                                def.$type = def.validate;
                            }
                        }
                    });

                    if (angular.isDefined(metadata) &&
                        angular.isDefined(metadata.order)) {
                        orderedSchema = metadata.order.map(function (field) {
                            return {
                                field: field,
                                def: schema[field]
                            }
                        });
                    } else {
                        orderedSchema = _.map(schema, function (def, field) {
                            return {
                                field: field,
                                def: def
                            };
                        });
                    }
                    scope.schema = orderedSchema;
                }
            }
        });
})();
