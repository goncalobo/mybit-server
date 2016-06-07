var sql = require('seriate');
var scheduler = require('node-schedule');
var sqlConfig = require('../config').sqlConfig;
var cmxConfig = require('../config').cmxConfig;
var https = require("https");

exports.roomStats = function(req, res) {
    if (req.params.query == "Booked") {
        sql.execute(sqlConfig, {
                query: "SELECT TOP 5 Name, TotalCounter FROM tblRoom ORDER BY tblRoom.TotalCounter DESC"
            })
            .then(function(result) {
                return res.send(result)
            }, function(err) {
                return res.send(err)
            })
    } else
    if (req.params.query == "Hours") {
        sql.execute(sqlConfig, {
                query: "SELECT TOP 5 Name, TotalHours FROM tblRoom ORDER BY tblRoom.TotalHours DESC"
            })
            .then(function(result) {
                return res.send(result)
            }, function(err) {
                return res.send(err)
            })
    } else
    if (req.params.query == "TotalDuration") {
        sql.execute(sqlConfig, {
                query: "SELECT SUM(tblRoom.TotalHours) AS 'TotalDuration' FROM tblRoom WHERE tblRoom.TotalHours IS NOT NULL"
            })
            .then(function(result) {
                return res.send(result[0])
            }, function(err) {
                return res.send(err)
            })
    } else
    if (req.params.query == "FormalVSInformal") {
        sql.execute(sqlConfig, {
                query: "SELECT " +
                    "(SELECT SUM(tblRoom.TotalCounter) AS 'Total' FROM tblRoom WHERE tblRoom.Formal = 1 AND tblRoom.TotalCounter IS NOT NULL)" +
                    "AS 'Formal', " +
                    "(SELECT SUM(tblRoom.TotalCounter) AS 'Total' FROM tblRoom WHERE tblRoom.Formal = 0 AND tblRoom.TotalCounter IS NOT NULL)" +
                    "AS 'Informal'"
            })
            .then(function(result) {
                return res.send(result[0])
            }, function(err) {
                return res.send(err)
            })
    } else
        res.send({
            error: "Wrong query. (Booked | Hours | TotalDuration | FormalVSInformal)"
        })
}

exports.applicationStats = function(req, res) {
    if (req.params.query == "Users") {
        var curr = new Date,
            firstday, lastday;
        if (req.params.period == "Weekly") {
            firstday = new Date(curr.setDate(curr.getDate() - curr.getDay())).toISOString();
            lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6)).toISOString();
            sql.execute(sqlConfig, {
                    query: "SELECT COUNT(*) AS 'WeeklyUsers' FROM tblUser WHERE tblUser.LastActivity BETWEEN '" + firstday + "' AND '" + lastday + "'"
                })
                .then(function(result) {
                    return res.send(result[0])
                })
        }
        if (req.params.period == "Monthly") {
            firstday = new Date(curr.getFullYear(), curr.getMonth(), 1).toISOString();
            lastday = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).toISOString();
            sql.execute(sqlConfig, {
                    query: "SELECT COUNT(*) AS 'MonthtlyUsers' FROM tblUser WHERE tblUser.LastActivity BETWEEN '" + firstday + "' AND '" + lastday + "'"
                })
                .then(function(result) {
                    return res.send(result[0])
                })
        }
    } else
    if (req.params.query == "Rooms") {
        if (req.params.period == "Weekly")
            sql.execute(sqlConfig, {
                query: "SELECT SUM(tblRoom.WeeklyCounter) AS 'WeeklyCounter' FROM tblRoom WHERE tblRoom.WeeklyCounter IS NOT NULL"
            })
            .then(function(result) {
                return res.send(result[0])
            })
        if (req.params.period == "Monthly")
            sql.execute(sqlConfig, {
                query: "SELECT SUM(tblRoom.MonthlyCounter) AS 'MonthlyCounter' FROM tblRoom WHERE tblRoom.MonthlyCounter IS NOT NULL"
            })
            .then(function(result) {
                return res.send(result[0])
            })
    } else
    if (req.params.query == "Notifications") {
        if (req.params.period == "Weekly")
            sql.execute(sqlConfig, {
                query: "SELECT SUM(tblUser.WeeklyNotifications) AS 'WeeklyNotifications' FROM tblUser WHERE tblUser.WeeklyNotifications IS NOT NULL"
            })
            .then(function(result) {
                return res.send(result[0])
            })
        if (req.params.period == "Monthly")
            sql.execute(sqlConfig, {
                query: "SELECT SUM(tblUser.MonthlyNotifications) AS 'MonthlyNotifications' FROM tblUser WHERE tblUser.MonthlyNotifications IS NOT NULL"
            })
            .then(function(result) {
                return res.send(result[0])
            })
    } else
        res.send({
            error: "Wrong query."
        })
}

exports.inflowStats = function(req, res) {
    if (req.params.query == "Building" && req.params.time == "Now") {
        var options = {
            host: cmxConfig.host,
            port: cmxConfig.port,
            path: '/api/analytics/v1/overview?areas=1666&yAxis=absoluteVisits&timeRange=now&period=today&durationCategories=5-480&includeStationary=false&type=deviceCount&_=14648010524570',
            method: 'GET',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': cmxConfig.auth
            }
        }

        var data;

        req = https.request(options, function(result) {
            result.setEncoding('utf8');
            result.on('data', function(chunk) {
                data = JSON.parse(chunk);
            });

            result.on('end', function(result) {
                var info = {
                    "TotalVisitors": data.value.primary.value,
                    "RepeatVisitors": data.value.primary.breakdown[0].value,
                    "NewVisitors": data.value.primary.breakdown[1].value
                }
                res.send(info);
            });
        });

        req.on('error', function(e) {
            res.json({
                error: 'Can\'t connect to cisco cmx.'
            });
        });

        req.end();
    } else if (req.params.query == "Building" && req.params.time == "History") {
        var history = [];
        getBuildingHistoryStats(res, history, 1);
    } else
    if (req.params.query == "Floor" && req.params.time == "Now") {
        var options = {
            host: cmxConfig.host,
            port: cmxConfig.port,
            path: '/api/analytics/v1/deviceCount?areas=1666&granularity=Floor&yAxis=absoluteVisits&timeRange=now&period=today&durationCategories=5-480&includeStationary=false&_=1464945189755',
            method: 'GET',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': cmxConfig.auth
            }
        }

        var data;

        req = https.request(options, function(result) {
            result.setEncoding('utf8');
            result.on('data', function(chunk) {
                data = JSON.parse(chunk);
            });

            result.on('end', function(result) {
                var info = {
                    "Piso1TotalVisitors": data.results[0].data[0].value,
                    "Piso2TotalVisitors": data.results[1].data[0].value,
                    "Piso3TotalVisitors": data.results[2].data[0].value,
                    "Piso4TotalVisitors": data.results[3].data[0].value,
                    "Piso5TotalVisitors": data.results[4].data[0].value
                }
                res.send(info);
            });
        });

        req.on('error', function(e) {
            res.json({
                error: 'Can\'t connect to cisco cmx.'
            });
        });

        req.end();
    } else if (req.params.query == "Floor" && req.params.time == "History") {
        var history = [];
        getFloorHistoryStats(res, history, 1);
    } else
        res.send({
            error: "Wrong query. (Building/[Now | History] | Floor[Now | History])"
        });

}

function getBuildingHistoryStats(res, history, count) {
    var timeInterval = getWeek(count);
    var options = {
        host: cmxConfig.host,
        port: cmxConfig.port,
        path: '/api/analytics/v1/overview?areas=1666&yAxis=absoluteVisits&timeRange=00%3A00-23%3A59&period=' + timeInterval[0].getFullYear() + '-' + (timeInterval[0].getMonth() + 1) + '-' + timeInterval[0].getDate() + '%3B' + timeInterval[1].getFullYear() + '-' + (timeInterval[1].getMonth() + 1) + '-' + timeInterval[1].getDate() + '&durationCategories=5-480&includeStationary=false&type=deviceCount&_=1464944284542',
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': cmxConfig.auth
        }
    }

    var data;
    req = https.request(options, function(result) {

        result.setEncoding('utf8');
        result.on('data', function(chunk) {
            data = JSON.parse(chunk);
        });

        result.on('end', function(result) {
            var info = {
            	"Week": count,
                "Start": timeInterval[0].getFullYear() + '-' + (timeInterval[0].getMonth() + 1) + '-' + timeInterval[0].getDate(),
                "End": timeInterval[1].getFullYear() + '-' + (timeInterval[1].getMonth() + 1) + '-' + timeInterval[1].getDate(),
                "TotalVisitors": data.value.primary.value,
                "RepeatVisitors": data.value.primary.breakdown[0].value,
                "NewVisitors": data.value.primary.breakdown[1].value
            }
            history.push(info);
            count++;
            if (count == 5)
                res.send(history);
            else {
                getBuildingHistoryStats(res, history, count);
            }
        });
    });

    req.on('error', function(e) {
        res.json({
            error: 'Can\'t connect to cisco cmx.'
        });
    });

    req.end();
}

function getFloorHistoryStats(res, history, count) {
    var timeInterval = getWeek(count);
    var options = {
        host: cmxConfig.host,
        port: cmxConfig.port,
        path: '/api/analytics/v1/deviceCount?areas=1666&granularity=Floor&yAxis=absoluteVisits&timeRange=00%3A00-23%3A59&period=' + timeInterval[0].getFullYear() + '-' + (timeInterval[0].getMonth() + 1) + '-' + timeInterval[0].getDate() + '%3B' + timeInterval[1].getFullYear() + '-' + (timeInterval[1].getMonth() + 1) + '-' + timeInterval[1].getDate() + '&durationCategories=5-480&includeStationary=false&_=1464945400900',
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': cmxConfig.auth
        }
    }

    var data;
    req = https.request(options, function(result) {

        result.setEncoding('utf8');
        result.on('data', function(chunk) {
            data = JSON.parse(chunk);
        });

        result.on('end', function(result) {
            var info = {
            	"Week": count,
                "Start": timeInterval[0].getFullYear() + '-' + (timeInterval[0].getMonth() + 1) + '-' + timeInterval[0].getDate(),
                "End": timeInterval[1].getFullYear() + '-' + (timeInterval[1].getMonth() + 1) + '-' + timeInterval[1].getDate(),
                "Piso1TotalVisitors": data.results[0].data[0].value,
                "Piso2TotalVisitors": data.results[1].data[0].value,
                "Piso3TotalVisitors": data.results[2].data[0].value,
                "Piso4TotalVisitors": data.results[3].data[0].value,
                "Piso5TotalVisitors": data.results[4].data[0].value
            }

            history.push(info);
            count++;
            if (count == 5)
                res.send(history);
            else
                getFloorHistoryStats(res, history, count);
        });
    });

    req.on('error', function(e) {
        res.json({
            error: 'Can\'t connect to cisco cmx.'
        });
    });

    req.end();

}

var monthlyRule = new scheduler.RecurrenceRule();
monthlyRule.dayOfMonth = [0];
monthlyRule.hour = 0;
monthlyRule.minute = 0;
scheduler.scheduleJob(monthlyRule, function() {
    sql.execute(sqlConfig, {
        query: "UPDATE tblRoom SET tblRoom.MonthlyCounter = 0 FROM tblRoom"
    })
});

var weeklyRule = new scheduler.RecurrenceRule();
weeklyRule.dayOfWeek = [1];
weeklyRule.hour = 0;
weeklyRule.minute = 0;
scheduler.scheduleJob(weeklyRule, function() {
    sql.execute(sqlConfig, {
        query: "UPDATE tblRoom SET tblRoom.WeeklyCounter = 0 FROM tblRoom"
    })
});

function getWeek(interval) {
    var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * interval * 1000);
    day = beforeOneWeek.getDay();
    diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
    lastMonday = new Date(beforeOneWeek.setDate(diffToMonday));
    lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
    return [lastMonday, lastSunday];
}
