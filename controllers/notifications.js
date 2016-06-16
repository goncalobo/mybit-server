var gcm = require('node-gcm');
var apn = require('apn');
var scheduler = require('node-schedule');
var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

var gcmSender = new gcm.Sender(require('../config').notificationConfig.android);
var apnSender = new apn.Connection(require('../config').notificationConfig.ios);

exports.notify = function (req, res) {

    var users;
    if(req.body.users.length > 0)
        users = req.body.users.split(",");
    else users = [];

    var queryBuilder = "SELECT tblUser.Username, tblUser.AppToken, tblUser.Device FROM tblUser WHERE (tblUser.Username = '" + users[0] + "' " ;

    for(var i = 1; i<users.length; i++)
        queryBuilder += " OR tblUser.Username = '" + users[i] + "'";
    queryBuilder += ")";

    sql.execute(sqlConfig,{
        query:queryBuilder
    }).then(function (devices) {

        // Android
        var message = new gcm.Message();
        message.addData('hello', 'world');
        message.addNotification('title', req.decoded.displayname + ' is looking for you.');
        message.addNotification('icon', '@drawable/icon');
        message.addNotification('body', 'Meeting point: ');
        message.addNotification('sound','default');

        // iOS
        var note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 3;
        note.sound = "ping.aiff";
        note.alert = "\uD83D\uDCE7 \u2709 " + req.decoded.displayname + ' is looking for you.';
        note.payload = {'messageFrom': req.decoded.displayname};

        var androidDevices = [];
        var iosDevices = [];

        for(var d in devices) {
            if (devices[d].Device == "Android" || devices[d].Device == "android")
                androidDevices.push(devices[d].AppToken)

            if (devices[d].Device == "iOS" || devices[d].Device == "ios")
                iosDevices.push(new apn.Device(devices[d].AppToken))

            updateCounter(devices[d].Username)
        }

        gcmSender.send(message, androidDevices, function (err, response) {
            if(err) {
                console.error(err);
            } else {
                console.log(response);
            }
        });

        for(var i in iosDevices)
            apnSender.pushNotification(note, iosDevices[i]);

        return res.send({message:"Notifications sent."})

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