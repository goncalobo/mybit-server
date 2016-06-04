var jwt = require('jsonwebtoken');
var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

exports.findUser = function (username, email, name) {

    var d = new Date();

    sql.execute( sqlConfig, {
            query: "SELECT * FROM tblUser WHERE tblUser.Username = '" + username + "'"
        }
    ).then(function (results) {
        if (results.length != 0) {
            sql.execute(sqlConfig, {query: "UPDATE tblUser SET tblUser.LastActivity = '"+d.toISOString()+"' FROM tblRoom"}); return;
        }
        else {
            sql.execute( sqlConfig, {
                    query: "INSERT INTO tblUser (Username, Email, Name, LastActivity) VALUES ('"+username+"', '"+email+"', '"+name+"', '" + d.toISOString() + "')"
                }
            ).then(function (results) {
                console.log(results);
                return true;
            }, function (err) {
                console.log(err);
                return false;
            })
        }
    }, function (err) {
        return false;
    })
}

exports.createSession = function(data, secret) {
    var token = jwt.sign(data, secret, {
        expiresIn: "12 days" // expires in 3*24 hours
    });
    return token;
};