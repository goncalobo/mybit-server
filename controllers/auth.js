var User = require('../models/user');
var Session = require('../models/session');
var sleep = require('sleep');
var jwt = require('jsonwebtoken');

var sql = require ('seriate');

var ActiveDirectory = require('activedirectory');
var ADConfig = require('../config.js').activeDirectoryConfig;
var AD = new ActiveDirectory(ADConfig);

exports.authUser = function (req, res) {

    var username = req.body.username;
    var password = req.body.password;


    return true;
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


exports.generateToken = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var secret = 'mybitsecretkey';

    //Verificar se o utilizador é real
    console.log('Calling authUser with ' + req.body.email + '\n');
    var token = Session.createSession(username, secret);

    res.json ({
        success : true,
        token : token
    });
}


exports.verifyToken = function (req, res, next) {
    var secret = 'mybitsecretkey';
    var token = req.headers['authorization'];

    if (token) {

        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                console.log('\nSuccess');
                req.decoded = decoded;
                console.dir(decoded);
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}


exports.refreshToken = function (req, res) {
    //Verificar se o token é valido
    var token = req.headers['authorization'];
    var secret = 'mybitsecretkey';
    jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'Invalid token provided.'
                 });
            } else {
                req.decoded = decoded;
                console.dir(decoded);

                //Gerar novo token com nova data de expiracao
                var tokenRefresh = Session.createSession(decoded.username, secret);
                console.log('Username: '+ decoded.username + '\n');
                return res.json({
                    success : true,
                    token : tokenRefresh
                });
            }
        });

}
