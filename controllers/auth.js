var User = require('../models/user');
var jwt = require('jsonwebtoken');


var ActiveDirectory = require('activedirectory');
var ADConfig = require('../config.js').activeDirectoryConfig;
var AD = new ActiveDirectory(ADConfig);


exports.authUser = function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    var user = User.selectFromDB(username);
/*
        AD.authenticate(username, password, function(err, auth) {
            if (err) {
                console.log('ERROR: '+JSON.stringify(err));
                return;
            }
            if (auth) {*/
                console.log('Authenticated!');
                    var token = jwt.sign({username : username, password : password}, req.app.get('secret'), {
                        expiresIn: 24*60*60*3 // expires in 3*24 hours
                    });
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });/*
            }
            else {
                res.json({success: false, message: 'Authentication failed. User not found.'});
            }
        });*/

};
