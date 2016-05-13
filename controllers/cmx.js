var https = require("https");

var cmxConfig = require('../config').cmxConfig;

exports.getLocation = function (req, res) {

    var options = {
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

    //Ter a certeza que foi passado um parametro username e verificar se existe na db
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
            console.log(data);

            if(data[0] === undefined)
                res.send({
                    error:"User not found."
                })

            var info = {
                "UserName" : data[0].userName,
                "MacAddress" : data[0].macAddress,
                //"LastActivity" : Date(Number(data[0].changedOn)).toString(),
                "MapInfo" : data[0].mapInfo.mapHierarchyString,
                "MapImage" : "/images/floors/" + data[0].mapInfo.image.imageName,
                "Coordinates" : {
                    "x" : data[0].mapCoordinate.x,
                    "y" : data[0].mapCoordinate.y
                },
                "FloorInfo" : {
                    "length": data[0].mapInfo.floorDimension.length,
                    "width": data[0].mapInfo.floorDimension.width
                }
            };
            res.send(info);
        });
    });

    req.on('error', function(e)
    {
        res.json({message:'Can\'t connect to cisco cmx.'});
    });

    req.end();

}