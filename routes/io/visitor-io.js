'use strict';


/**
 * @doc module
 * @name routes.io:visitor-io
 * @param app
 * @returns {{ready: function()}}
 */
module.exports = function (app) {

  var io = require('../../utils/io')(app);

  return {
    /**
     * @doc function
     * @name routes.io:visitor-io#ready
     * @param {Request} req Request object
     * @descripion
     * Joins the "visitor" room and emits joblist.
     */
    'ready': function ready (req) {
      req.io.join('visitor');
      io.emitJobs(req);
    }
  };
};
