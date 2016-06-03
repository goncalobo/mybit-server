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