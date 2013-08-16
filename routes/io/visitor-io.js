'use strict';


module.exports = function (app) {

  var io = require('../../utils/io')(app);

  return {
    'ready': function (req) {
      req.io.join('visitor');
    }
  };
};
