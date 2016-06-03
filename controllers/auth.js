var User = require('../models/user');
var jwt = require('jsonwebtoken');

var sql = require ('seriate');

var ActiveDirectory = require('activedirectory');
var ADConfig = require('../config.js').activeDirectoryConfig;
var AD = new ActiveDirectory(ADConfig);

exports.generateToken = function (req, res) {

    var secret = req.body.secret;

    if(secret !== undefined){
        if(secret === require('../config').secret){
            console.log('Authing service.\n');
            var token = User.createSession({service:"SkypeService"}, secret);
            return res.json({
                success : true,
                token : token
            });
        }

        return res.json({
            error: "Wrong secret."
        })
    }

    const email = req.body.email;
    const password = req.body.password;

    secret = require('../config').secret;

    if(email === undefined || password === undefined || email.indexOf('@') < 0)
        return res.json({
            error: "Email/password not sent."
        })

    const username = email.substr(0,email.indexOf('@'));

    AD.authenticate(email, password, function(err, auth) {
        if (err) {
            console.log('ERROR: '+JSON.stringify(err));

            res.json ({
                success : false,
                error : err
            });
            return;
        }
        if (auth) {
            AD.findUser(username, function(err, user) {
                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    return;
                }

                if (!user) console.log('User: ' + username + ' not found.');
                else {
                    var name = user.displayName;
                    User.findUser(username, email, name);
                    var token = User.createSession({username: username, displayname: name, email:email}, secret);

                    return res.json({
                        success: true,
                        token: token
                    });
                }
            });
        }
        else {
            console.log('Authentication failed!');
            res.json ({
                success : false
            });
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
                req.decoded = decoded;
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
            var tokenRefresh = User.createSession(decoded.username, secret);
            console.log('Username: '+ decoded.username + '\n');
            return res.json({
                success : true,
                token : tokenRefresh
            });
        }
    });

}

exports.getUser = function(req, res) {
    console.log(req.decoded)
    res.send({
        "username": req.decoded.username,
        "displayname": req.decoded.displayname,
        "email": req.decoded.email
    });
};