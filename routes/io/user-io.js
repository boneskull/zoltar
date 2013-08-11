'use strict';

module.exports = function (app) {
    return {
        'ready': function (req) {
            req.io.join('user');
        },
        'logout': function (req) {
            req.io.leave('user');
            req.io.leave('admin');
        }
    };
};
