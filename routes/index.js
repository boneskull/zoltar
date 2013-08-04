
/*
 * GET home page.
 */

var globals = require('../globals');

exports.index = function(req, res){

    var data =  { version: globals.appVersion, name: globals.appName, title: 'Express' };
    console.log(data);
  res.render('index', data);
};