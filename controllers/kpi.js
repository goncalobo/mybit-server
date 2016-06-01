var sql = require('seriate');
var sqlConfig = require('../config').sqlConfig;
var https = require("https");

exports.getTopRooms = function (req, res) {
    if(req.params.query == "Booked") {
    sql.execute(sqlConfig, {
        query: "SELECT TOP 5 Name, BookingCounter FROM tblRoom ORDER BY tblRoom.BookingCounter DESC"
    })
        .then(function (result) {
            return res.send(result)
        }, function (err) {
            return res.send(err)
        })
    } else
    if(req.params.query == "Hours") {
        sql.execute(sqlConfig, {
            query: "SELECT TOP 5 Name, BookingHours FROM tblRoom ORDER BY tblRoom.BookingHours DESC"
        })
            .then(function (result) {
                return res.send(result)
            }, function (err) {
                return res.send(err)
            })
    } else
    if(req.params.query == "TotalDuration") {
        sql.execute(sqlConfig, {
            query: "SELECT SUM(tblRoom.BookingHours) AS 'TotalDuration' FROM tblRoom WHERE tblRoom.BookingHours IS NOT NULL"
        })
            .then(function (result) {
                return res.send(result[0])
            }, function (err) {
                return res.send(err)
            })
    } else
    if(req.params.query == "FormalVSInformal") {
        sql.execute(sqlConfig, {
            query: "SELECT " +
            "(SELECT SUM(tblRoom.BookingCounter) AS 'Total' FROM tblRoom WHERE tblRoom.Formal = 1 AND tblRoom.BookingCounter IS NOT NULL)" +
            "AS 'Formal', " +
            "(SELECT SUM(tblRoom.BookingCounter) AS 'Total' FROM tblRoom WHERE tblRoom.Formal = 0 AND tblRoom.BookingCounter IS NOT NULL)" +
            "AS 'Informal'"
        })
            .then(function (result) {
                return res.send(result[0])
            }, function (err) {
                return res.send(err)
            })
    } else
        res.send({error:"Wrong query. (Booked | Hours | TotalDuration | FormalVSInformal)"})

}

exports.getTopBookedRoomsByHours = function (req, res) {
    sql.execute(sqlConfig, {
        query: "SELECT TOP 5 Name, BookingHours FROM tblRoom ORDER BY tblRoom.BookingHours DESC"
    })
        .then(function (result) {
            console.log(result);
            res.send(":)")
        }, function (err) {
            console.log(err);
            res.send(":(")
        })
}

/*
*    var options = {
 host: cmxConfig.host,
 port: cmxConfig.port,
 path: '/api/location/v2/clients?username='+req.query.username,
 method: 'GET',
 rejectUnauthorized: false,
 headers: {
 'Content-Type': 'application/json',
 'Authorization': cmxConfig.auth
 }
 }

 if(req.query.username == undefined){
 res.json({message:'Please pass an username as parameter'});
 }

 var data;

 req = https.request(options, function(result)
 {
 result.setEncoding('utf8');
 result.on('data', function (chunk)
 {
 data = JSON.parse(chunk);
 });

 result.on('end', function(result)
 {
 if(data[0] === undefined)
 return res.send({
 error:"User not found."
 })

 var wing;
 if(parseFloat(data[0].mapCoordinate.x) < parseFloat(data[0].mapInfo.floorDimension.width)/2)
 wing = "West"
 else wing = "East"

 var info = {};

 res.send(info);
 });
 });

 req.on('error', function(e)
 {
 res.json({error:'Can\'t connect to cisco cmx.'});
 });

 req.end();
* */