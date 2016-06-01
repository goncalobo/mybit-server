var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

var ews = require('ews-javascript-api');
var ewsConfig = require('../config').ewsConfig;
var exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013);

exch.Credentials = new ews.ExchangeCredentials(ewsConfig.email, ewsConfig.password);
exch.Url = new ews.Uri (ewsConfig.uri);

exports.BookRoom = function (req, res) {
    //var req = new ews.GetRoomListsRequest(exch).Execute();
    var appointment = new ews.Appointment(exch);
    //Set datetime
    appointment.Start = new ews.DateTime(ews.DateTime.Now.TotalMilliSeconds + ews.TimeSpan.FromHours(0).asMilliseconds());
    appointment.End = new ews.DateTime(ews.DateTime.Now.TotalMilliSeconds + ews.TimeSpan.FromHours(1).asMilliseconds())
    appointment.Location = "HeartBIT Room 1E1 F12Pax VC";
    appointment.Subject = "Testing EWS-Booking";
    
    appointment.Save(ews.SendInvitationsMode.SendToNone)
        .then(function (availabilityResponse) {
            res.send(availabilityResponse);
        }, function (errors) {
            res.send(errors);
        });
}

exports.getAvailability = function (req, res) {

    const alias = req.body.room;
    const starttime = new ews.DateTime.Parse(req.body.date).TotalMilliSeconds;
    const endtime   = starttime + 24*60*60*1000; //one day

    var queryEWS = function (timeWindow, attendee) {
        exch.GetUserAvailability(attendee, timeWindow, ews.AvailabilityData.FreeBusyAndSuggestions)
            .then(function (availabilityResponse) {

                var info = [];
                var result = SCHEDULE;
                var meetings = availabilityResponse.attendeesAvailability.responses[0].calendarEvents;

                for(var m in meetings) {
                    info.push({
                        startTime : meetings[m].startTime.momentDate,
                        endTime   : meetings[m].endTime.momentDate,
                        subject   : meetings[m].details.subject
                    });
                }

                for(var r in result)
                    for(var i in info)
                        if((formatTime(info[i].startTime) <= result[r][1]) && (formatTime(info[i].endTime) >= result[r][0]))
                            result.splice(r, 1);

                return res.send(result);

            }, function (errors) {
                console.log(errors)
            });
    }

    sql.execute(sqlConfig,{
        query:"SELECT tblRoom.Email FROM tblRoom WHERE tblRoom.Alias ='" + alias + "'"
    }).then(function (result) {
        var timeWindow = new ews.TimeWindow(new ews.DateTime(starttime), new ews.DateTime(endtime));
        var attendee =[ new ews.AttendeeInfo(result[0].Email)];
        queryEWS(timeWindow, attendee);
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