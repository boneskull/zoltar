'use strict';

module.exports = function (app) {
    app.io.route('user', {
        'ready': function (req) {
            req.io.join('user');
        },
        'logout': function (req) {
            req.io.leave('user');
            req.io.leave('admin');
        }
    });
};
