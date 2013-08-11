'use strict';

module.exports = function (app) {
    return {
        'ready': function (req) {
            req.io.join('visitor');
        }
    };
};
