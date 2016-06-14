var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

var ews = require('ews-javascript-api');
var ewsConfig = require('../config').ewsConfig;
var exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013);

exch.Credentials = new ews.ExchangeCredentials(ewsConfig.email, ewsConfig.password);
exch.Url = new ews.Uri (ewsConfig.uri);

exports.BookRoom = function (req, res) {

    const alias = req.body.room;
    const startTime = new ews.DateTime.Parse(req.body.start).TotalMilliSeconds;
    const endTime   = startTime + 60*60*1000; // 1 hour

    var attendees = JSON.parse(req.body.attendees);
    var appointment = new ews.Appointment(exch);

    var queryBuilder = "SELECT tblUser.Email FROM tblUser WHERE (tblUser.Username = '" + attendees[0] + "' " ;
    for(var i = 1; i<attendees.length; i++)
        queryBuilder += " OR tblUser.Username = '" + attendees[i] + "'";
    queryBuilder += ")";

    sql.execute(sqlConfig,{
        query:  "SELECT tblRoom.Name, tblRoom.Email FROM tblRoom WHERE tblRoom.Alias = '" + alias + "'"
    })
        .then(function (roomResult) {
            sql.execute(sqlConfig,{
                query:  queryBuilder
            })
                .then(function (attendeesResult) {
                    var room = [new ews.AttendeeInfo(roomResult[0].Email)];
                    var timeWindow = new ews.TimeWindow(new ews.DateTime(startTime), new ews.DateTime(endTime + 24 * 60 * 60 * 1000));

                    appointment.Start = new ews.DateTime(startTime);
                    appointment.End = new ews.DateTime(endTime);
                    appointment.Location = roomResult[0].Name;
                    appointment.Subject = req.decoded.displayname;

                    appointment.RequiredAttendees.Add(roomResult[0].Email);
                    appointment.RequiredAttendees.Add(req.decoded.email);

                    for (var a in attendees)
                        appointment.RequiredAttendees.Add(attendeesResult[a].Email);

                    return scheduleIfAvailable(room, timeWindow, appointment);
                });
        });

    var scheduleIfAvailable = function (room, timeWindow, appointment) {
        return exch.GetUserAvailability(room, timeWindow, ews.AvailabilityData.FreeBusyAndSuggestions)
            .then(function (availabilityResponse) {
                var info = [];
                var meetings = availabilityResponse.attendeesAvailability.responses[0].calendarEvents;
                for (var m in meetings) {
                    info.push({
                        startTime: meetings[m].startTime.momentDate,
                        endTime: meetings[m].endTime.momentDate
                    });
                }

                for (var i in info) {
                    if ((info[i].startTime < appointment.End.momentDate)
                        && (info[i].endTime > appointment.Start.momentDate))
                        return res.send({error: "Scheduled meetings overlaps existing meetings."});
                }

                appointment.Save(ews.SendInvitationsMode.SendToAllAndSaveCopy)
                    .then(function (availabilityResponse) {
                        var duration = (endTime - startTime) / (1000 * 60 * 60); //in hours

                        updateCounter(alias, duration);
                        res.send({
                            success: "Room booked.",
                            start: appointment.Start.momentDate,
                            end: appointment.End.momentDate,
                            location: appointment.Location,
                            subject: appointment.Subject,
                            duration: duration
                        });

                    });
            })
    }
}

exports.getScheduledMeetings = function (req, res) {

    const currentMonth = (new Date().getMonth()) + 1;
    const currentYear = new Date().getYear();
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const alias = req.body.room;
    const startTime = new ews.DateTime.Parse(firstDayOfMonth).TotalMilliSeconds;

    var endTime = 0;

    if(req.body.months === undefined)
        endTime = startTime + daysInMonth()*24*60*60*1000; // total ms for this month
    else { // total ms for this month
        endTime = startTime;
        for(var i = 0; i < req.body.months; i++)
            endTime += daysInMonth(currentMonth+i,currentYear)*24*60*60*1000;
    }

    sql.execute(sqlConfig,{
        query:"SELECT tblRoom.Email FROM tblRoom WHERE tblRoom.Alias ='" + alias + "'"
    }).then(function (result) {
        var timeWindow = new ews.TimeWindow(new ews.DateTime(startTime), new ews.DateTime(endTime));
        var room =[ new ews.AttendeeInfo(result[0].Email)];
        queryEWS(room, timeWindow);
    },function (err) {
        console.log(err);
    });

    var queryEWS = function (room, timeWindow) {
        exch.GetUserAvailability(room, timeWindow, ews.AvailabilityData.FreeBusy)
            .then(function (availabilityResponse) {
                var info = [];
                var meetings = availabilityResponse.attendeesAvailability.responses[0].calendarEvents;

                for(var m in meetings) {
                    info.push({
                        startTime : meetings[m].startTime.momentDate,
                        endTime   : meetings[m].endTime.momentDate,
                        subject   : meetings[m].details.subject
                    });
                }

                return res.send(info);

            }, function (errors) {
                console.log(errors)
            });
    }
}

exports.getAvailability = function (req, res) {

    const alias = req.body.room;
    const startTime = new ews.DateTime.Parse(new Date(req.body.date)).TotalMilliSeconds;

    const endTime   = startTime + 24*60*60*1000; //one day

    var queryEWS = function (room, timeWindow) {
        exch.GetUserAvailability(room, timeWindow, ews.AvailabilityData.FreeBusy)
            .then(function (availabilityResponse) {

                var info = [];
                var result = SCHEDULE;
                var meetings = availabilityResponse.attendeesAvailability.responses[0].calendarEvents;

                for(var m in meetings) {
                    info.push({
                        startTime : meetings[m].startTime.momentDate,
                        endTime   : meetings[m].endTime.momentDate
                    });
                }

                for (var i in info) {
                    var r = -1;
                    while(r < result.length-1){
                        r++;
                        //console.log("\n>\n"+ (info[i].startTime).toString() + " - " + (info[i].endTime).toString() + "\n" + result[r][0] + " - " + result[r][1] + "\n\n");
                        if ((formatTime(info[i].startTime) < result[r][1]) && (formatTime(info[i].endTime) > result[r][0]))
                        {result.splice(r, 1); r = -1;}
                        //console.log(result)
                        //console.log(r + " " + result.length)
                    }
                }


                return res.send({suggestions:result});

            }, function (errors) {
                console.log(errors)
            });
    }

    sql.execute(sqlConfig,{
        query:"SELECT tblRoom.Email FROM tblRoom WHERE tblRoom.Alias ='" + alias + "'"
    }).then(function (result) {
        var timeWindow = new ews.TimeWindow(new ews.DateTime(startTime), new ews.DateTime(endTime));
        var room = [ new ews.AttendeeInfo(result[0].Email)];
        queryEWS(room, timeWindow);
    },function (err) {
        console.log(err);
    })
}

exports.getRooms = function (req, res) {
    sql.execute( sqlConfig, {
        query: "SELECT * FROM tblRoom"
    } ).then( function( results ) {
        res.send(results);
    }, function( err ) {
        console.log( "Something bad happened:", err );
    } );
}

var updateCounter = function (alias, duration) {
    sql.execute(sqlConfig, {
        query: "DECLARE @a int " +
        "SET @a = (SELECT tblRoom.TotalCounter FROM tblRoom WHERE tblRoom.Alias = '" + alias + "') " +
        "UPDATE tblRoom SET tblRoom.TotalCounter = @a, @a=@a+1 WHERE tblRoom.Alias = '" + alias + "'"
    }).then(function () {
        sql.execute(sqlConfig, {
            query: "DECLARE @a float " +
            "SET @a = (SELECT tblRoom.TotalHours FROM tblRoom WHERE tblRoom.Alias = '" + alias + "') " +
            "UPDATE tblRoom SET tblRoom.TotalHours = @a, @a=@a+" + duration + " WHERE tblRoom.Alias = '" + alias + "'"
        }).then(function () {
            sql.execute(sqlConfig, {
                query: "DECLARE @a float " +
                "SET @a = (SELECT tblRoom.WeeklyCounter FROM tblRoom WHERE tblRoom.Alias = '" + alias + "') " +
                "UPDATE tblRoom SET tblRoom.WeeklyCounter = @a, @a=@a+1 WHERE tblRoom.Alias = '" + alias + "'"
            }).then(function () {
                sql.execute(sqlConfig, {
                    query: "DECLARE @a float " +
                    "SET @a = (SELECT tblRoom.MonthlyCounter FROM tblRoom WHERE tblRoom.Alias = '" + alias + "') " +
                    "UPDATE tblRoom SET tblRoom.MonthlyCounter = @a, @a=@a+1 WHERE tblRoom.Alias = '" + alias + "'"
                });
            })})})

}

var daysInMonth = function (month,year) {
    return new Date(year, month, 0).getDate();
}

var formatTime = function (date) {
    var result = "";

    if(date._d.getHours().toString().length < 2)
        result += "0" + date._d.getHours();
    else result += date._d.getHours();

    if(date._d.getMinutes().toString().length < 2)
        result += ":0" + date._d.getMinutes();
    else result += ":" + date._d.getMinutes();

    return result;
}

var SCHEDULE = [
    ['08:00','09:00'],
    ['08:30','09:30'],
    ['09:00','10:00'],
    ['09:30','10:30'],
    ['10:00','11:00'],
    ['10:30','11:30'],
    ['11:00','12:00'],
    ['11:30','12:30'],
    ['12:00','13:00'],
    ['12:30','13:30'],
    ['13:00','14:00'],
    ['13:30','14:30'],
    ['14:00','15:00'],
    ['14:30','15:30'],
    ['15:00','16:00'],
    ['15:30','16:30'],
    ['16:00','17:00']
];
