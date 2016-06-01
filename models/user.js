var jwt = require('jsonwebtoken');
var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

exports.findUser = function (username) {
    sql.execute( sqlConfig, {
            query: "SELECT * FROM tblUser WHERE tblUser.Username = '" + username + "'"
        }
    ).then(function (results) {
        if(results.length != 0)
            return true;
        else return false;
    }, function (err) {
        return false;
    })
}

exports.insertUser = function(username, email) {
    sql.execute( sqlConfig, {
            query: "INSERT INTO tblUser (Username, Email, NotificationCounter) VALUES ('"+username+"', '"+email+"', '"+0+"')"
        }
    ).then(function (results) {
        return true;
    }, function (err) {
        return false;
    })
}

exports.createSession = function(username, secret) {
    var token = jwt.sign({username : username}, secret, {
        expiresIn: "12 days" // expires in 3*24 hours
    });
    return token;
};