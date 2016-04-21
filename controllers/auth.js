var User = require('../models/user');

var ActiveDirectory = require('activedirectory');
var ADConfig = require('../config.js').activeDirectoryConfig;
var AD = new ActiveDirectory(ADConfig);

exports.authUser = function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    AD.authenticate(username, password, function(err, auth) {
        if (err) {
            console.log('ERROR: '+JSON.stringify(err));
            return;
        }
        if (auth) {
            console.log('Authenticated!');
            /** TODO:
             *  if(User.exists())
             *      User.SetActive(auth)
             *  else User.insertUser(username, password)
             */
        }
        else {
            console.log('Authentication failed!');
        }
    });
}