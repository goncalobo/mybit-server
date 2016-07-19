var http = require("http");
var gcm = require('node-gcm');
var apn = require('apn');
var scheduler = require('node-schedule');
var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

var gcmSender = new gcm.Sender(require('../config').notificationConfig.android);
var apnSender = new apn.Connection(require('../config').notificationConfig.ios);

exports.notify = function (req, res) {

    console.log(req.body);

    var users;
    var displayName = req.decoded.displayname;

    if(req.body.users != undefined && req.body.users != "")
        users = req.body.users.split(",");
    else return res.send({error:"No users to notify."});

    var options = {
        host: req.headers.host.split(':')[0],
        port: req.headers.host.split(':')[1],
        path: '/API/CMX/GetLocation?username='+req.decoded.username,
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'authorization': req.headers.authorization
        }
    }

    var data;
    req = http.request(options,function(result){
        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            data = JSON.parse(chunk)
            var queryBuilder = "SELECT tblUser.Username, tblUser.AppToken, tblUser.Device FROM tblUser WHERE (tblUser.Username = '" + users[0] + "' " ;

            for(var i = 1; i<users.length; i++)
                queryBuilder += " OR tblUser.Username = '" + users[i] + "'";
            queryBuilder += ")";

            sql.execute(sqlConfig,{
                query:queryBuilder
            }).then(function (devices) {

                var notification = {};

                // Android
                notification.android = new gcm.Message();
                notification.android.addData('hello', 'world');
                notification.android.addNotification('title', displayName + ' is looking for you.');
                notification.android.addNotification('icon', '@drawable/icon');
                notification.android.addNotification('body', 'Meeting point: ' + data.CurrentLocation);
                notification.android.addNotification('sound','default');

                // iOS
                notification.ios = new apn.Notification();
                notification.ios.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                notification.ios.badge = 3;
                notification.ios.sound = "ping.aiff";
                notification.ios.alert = "\uD83D\uDCE7 \u2709 " + displayName + ' is looking for you.';
                notification.ios.payload = {'messageFrom': displayName};

                var androidDevices = [];
                var iosDevices = [];

                for(var d in devices) {
                    if (devices[d].Device == "Android" || devices[d].Device == "android")
                        androidDevices.push(devices[d].AppToken)

                    if (devices[d].Device == "iOS" || devices[d].Device == "ios")
                        iosDevices.push(new apn.Device(devices[d].AppToken))

                    updateCounter(devices[d].Username)
                }

                gcmSender.send(notification.android, androidDevices, function (err, response) {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log(response);
                    }
                });

                for(var i in iosDevices)
                    apnSender.pushNotification(notification.ios, iosDevices[i]);

                res.send({message:"Notifications sent.",android:notification.android,ios:notification.ios})

            },function (err) {
                console.log(err);
            });
        })
    });

    req.end();
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