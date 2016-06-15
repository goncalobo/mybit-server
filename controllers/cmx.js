var https = require("https");
var cmxConfig = require('../config').cmxConfig;

exports.getLocation = function (req, res) {

    var username = req.query.username;

    var options = {
        host: cmxConfig.host,
        port: cmxConfig.port,
        path: '/api/location/v2/clients?username='+username,
        method: 'GET',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': cmxConfig.auth
        }
    }

    if(req.query.username == undefined){
        return res.json({message:'Please pass an username as parameter'});
    }

    var data;

    var noMCH = https.request(options, function(result) {
        result.setEncoding('utf8');
        result.on('data', function (chunk)
        {
            data = JSON.parse(chunk);

            if(data[0] === undefined)
                return;
            else{
                if(!data[0].mapInfo.mapHierarchyString.includes("HeartBit"))
                    if(!res.headersSent)
                        return res.send({error:"User outside Hearbit building."});
                var wing;
                if(parseFloat(data[0].mapCoordinate.x) < parseFloat(data[0].mapInfo.floorDimension.width)/2)
                    wing = "West"
                else wing = "East"

                    var info = {
                        "UserName" : username,
                        "MacAddress" : data[0].macAddress,
                        "MapInfo" : data[0].mapInfo.mapHierarchyString,
                        "Wing" : wing,
                        "CurrentLocation" : data[0].mapInfo.mapHierarchyString.replace("Portugal>EstruturaCentral-","") + " - " + wing,
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
                    if(!res.headersSent)
                        return res.send(info);
                }
            });

        result.on('end', function(result)
            {    options.path = '/api/location/v2/clients?username=MCH\\\\'+username;

            var withMCH = https.request(options, function(result) {
                result.setEncoding('utf8');
                result.on('data', function (chunk)
                {
                    data = JSON.parse(chunk);

                    if(data[0] === undefined)
                        return;
                    else{
                        if(!data[0].mapInfo.mapHierarchyString.includes("HearBit"))
                            if(!res.headersSent)
                                return res.send({error:"User outside Hearbit building."});
                        var wing;
                        if(parseFloat(data[0].mapCoordinate.x) < parseFloat(data[0].mapInfo.floorDimension.width)/2)
                            wing = "West"
                        else wing = "East"

                            var info = {
                                "UserName" : username,
                                "MacAddress" : data[0].macAddress,
                                "MapInfo" : data[0].mapInfo.mapHierarchyString,
                                "Wing" : wing,
                                "CurrentLocation" : data[0].mapInfo.mapHierarchyString.replace("Portugal>EstruturaCentral-","") + " - " + wing,
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
                            if(!res.headersSent)
                             return res.send(info);
                     }
                 });

                result.on('end', function(result)
                {
                    if(!res.headersSent && data !== undefined)
                        return res.send({error:"User not found."})
                });
            });

            withMCH.on('error', function(e)
            {
                return res.json({error:'Can\'t connect to cisco cmx.'});
            });

            withMCH.end();


        });
    });

noMCH.on('error', function(e)
{
    return res.json({error:'Can\'t connect to cisco cmx.'});
});

noMCH.end();
}
