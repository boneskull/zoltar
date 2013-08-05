var User = require('../models/user.js');

module.exports = function (req, res) {
    console.log('success');
    res.send({success: true});
};