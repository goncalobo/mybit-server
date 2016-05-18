var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;

var ews = require('ews-javascript-api');
//create ExchangeService object
var exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013);
exch.Credentials = new ews.ExchangeCredentials("feupuser01@parceiro.sonae.pt", "feup%01");
//set ews endpoint url to use
exch.Url = new ews.Uri ("https://outlook.office365.com/EWS/exchange.asmx"); // you can also use exch.AutodiscoverUrl

exports.testEWS = function (req, res) {
    //var req = new ews.GetRoomListsRequest(exch).Execute();

    var appointment = new ews.Appointment(exch);
    //Set datetime
    /*appointment.Start = new ews.DateTime(ews.DateTime.Now.TotalMilliSeconds + ews.TimeSpan.FromHours(72).asMilliseconds());
    appointment.End = new ews.DateTime(ews.DateTime.Now.TotalMilliSeconds + ews.TimeSpan.FromHours(73).asMilliseconds())
    appointment.Location = "HeartBIT Room 1E1 F12Pax VC";
    appointment.Subject = "Testing EWS-Booking";
    appointment.Save(ews.SendInvitationsMode.SendToNone)
        .then(function (availabilityResponse) {
        res.send(availabilityResponse);
    }, function (errors) {
        res.send(errors);
    });*/



    //console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ Message here: \n' + appointment.Save(ews.SendInvitationsMode.SendToNone) + '\n\n\n\n\n\n\n\n\n\n\n\n');
    var attendee =[ new ews.AttendeeInfo("feupuser01@parceiro.sonae.pt")];
//create timewindow object o request avaiability suggestions for next 48 hours, DateTime and TimeSpan object is created to mimic portion of .net datetime/timespan object using momentjs
    var timeWindow = new ews.TimeWindow(ews.DateTime.Now, new ews.DateTime(ews.DateTime.Now.TotalMilliSeconds + ews.TimeSpan.FromHours(48).asMilliseconds()));
    exch.FindAppointments()
        .then(function (availabilityResponse) {
            res.send(availabilityResponse);
        }, function (errors) {
            res.send(errors);
        });
}

exports.getEWSRooms = function (req, res) {
    res.send(exch);
    exch.FindItems()
        .then(function (response) {
            res.send(response)
        }, function (errors) {
            res.send(errors)
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