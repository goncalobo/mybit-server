var User = require('../models/user');
var Session = require('../models/session');
var sleep = require('sleep');
var jwt = require('jsonwebtoken');

var sql = require ('seriate');

var ActiveDirectory = require('activedirectory');
var ADConfig = require('../config.js').activeDirectoryConfig;
var AD = new ActiveDirectory(ADConfig);

exports.generateToken = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    console.log('Authing user in AD with ' + username + '|' + password + '\n');

    var secret = require('../config').secret;

    AD.authenticate(username, password, function(err, auth) {
        if (err) {
            console.log('ERROR: '+JSON.stringify(err));

            res.json ({
                success : false,
                error : err
            });
            return;
        }
        if (auth) {
            console.log('Authenticated!');
            
            var token = Session.createSession(username, secret);
            console.log('Username: '+ username + '\n');
            return res.json({
                success : true,
                token : token
            });

        }
        else {
            console.log('Authentication failed!');
            res.json ({
                success : false
            });
            return;
        }
    });



}

exports.verifyToken = function (req, res, next) {

    var secret = require('../config').secret;

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
