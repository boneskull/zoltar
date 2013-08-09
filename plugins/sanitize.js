'use strict';

module.exports = function (schema, options) {

    options = options || {};
    options.accept = options.accept || [];
    options.decline = options.decline || [];

    schema.methods.sanitize = function (json) {
        var i = options.accept.length, o = {}, accept, decline, field;
        while (i--) {
            accept = options.accept[i];
            o[accept] = this[accept];
        }
        i = options.decline.length;
        if (options.accept.length) {
            while (i--) {
                decline = options.decline[i];
                delete o[decline];
            }
        } else {
            for (field in this) {
                if (this.hasOwnProperty(field)) {
                    if (typeof this[field] !== 'function' &&
                        options.decline.indexOf(field) === -1) {
                        o[field] = this[field];
                    }
                }
            }
        }
        return json ? JSON.stringify(o) : o;
    };

};