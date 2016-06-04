var android = require('node-gcm');
var apple = require('apn');
var scheduler = require('node-schedule');
var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

exports.notify = function (req, res) {

    var users = JSON.parse(req.body.users);
    var queryBuilder = "SELECT tblUser.AppID, tblUser.SO FROM tblUser WHERE (tblUser.Username = '" + users[0] + "' " ;

    for(var i = 1; i<users.length; i++)
        queryBuilder += " OR tblUser.Username = '" + users[i] + "'";
    queryBuilder += ")";

    sql.execute(sqlConfig,{
        query:queryBuilder
    }).then(function (result) {

        for(var i = 0; i<users.length; i++)
            updateCounter(users[i])

    },function (err) {
        console.log(err);
    });
}

var updateCounter = function (user) {
    sql.execute(sqlConfig, {
        query: "DECLARE @a float " +
        "SET @a = (SELECT tblUser.TotalNotifications FROM tblUser WHERE tblUser.Username = '" + user + "') " +
        "UPDATE tblUser SET tblUser.TotalNotifications = @a, @a=@a+1 WHERE tblUser.Username = '" + user + "'"
    }).then(function (result) {
        sql.execute(sqlConfig, {
            query: "DECLARE @a float " +
            "SET @a = (SELECT tblUser.WeeklyNotifications FROM tblUser WHERE tblUser.Username = '" + user + "') " +
            "UPDATE tblUser SET tblUser.WeeklyNotifications = @a, @a=@a+1 WHERE tblUser.Username = '" + user + "'"
        }).then(function (result) {
            sql.execute(sqlConfig, {
                query: "DECLARE @a float " +
                "SET @a = (SELECT tblUser.MonthlyNotifications FROM tblUser WHERE tblUser.Username = '" + user + "') " +
                "UPDATE tblUser SET tblUser.MonthlyNotifications = @a, @a=@a+1 WHERE tblUser.Username = '" + user + "'"
            })})});
}

var monthlyRule = new scheduler.RecurrenceRule();
monthlyRule.dayOfMonth = [0];
monthlyRule.hour   = 0;
monthlyRule.minute = 0;
scheduler.scheduleJob(monthlyRule, function(){
    sql.execute(sqlConfig, { query:"UPDATE tblUser SET tblUser.MonthlyNotifications = 0 FROM tblUser" })
});

var weeklyRule = new scheduler.RecurrenceRule();
weeklyRule.dayOfWeek = [1];
weeklyRule.hour   = 0;
weeklyRule.minute = 0;
scheduler.scheduleJob(weeklyRule, function(){
    sql.execute(sqlConfig, { query:"UPDATE tblUser SET tblUser.WeeklyNotifications = 0 FROM tblUser" })
});