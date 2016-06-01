var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

var ews = require('ews-javascript-api');
//create ExchangeService object
var exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013);
exch.Credentials = new ews.ExchangeCredentials("feupuser01@parceiro.sonae.pt", "feup%01");
//set ews endpoint url to use
exch.Url = new ews.Uri ("https://outlook.office365.com/EWS/exchange.asmx"); // you can also use exch.AutodiscoverUrl

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
                var meetings = availabilityResponse.attendeesAvailability.responses[0].calendarEvents;

                for(var m in meetings) {
                    info.push("{'startTime':'"+meetings[m].startTime +
                    "','endTime':'" + meetings[m].endTime +
                    "','subject':'" + meetings[m].details.subject + "}");
                }

                return res.send(info);
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



    //console.log(t1.getTime());


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