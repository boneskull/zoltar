'use strict';

module.exports = function (app) {

  require('./admin-io')(app);
  require('./user-io')(app);
  require('./visitor-io')(app);

};
