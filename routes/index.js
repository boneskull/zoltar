'use strict';

module.exports = function (app) {

  require('./admin')(app);
  require('./io')(app);
  require('./jobs')(app);
  require('./login')(app);
  require('./logout')(app);
  require('./main')(app);
  require('./orgs')(app);
  require('./register')(app);
  require('./states')(app);
  require('./users')(app);

};
