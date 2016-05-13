var https = require("https");
var express = require('express');

var cmxConfig = require('../config').cmxConfig;

var router = express.Router();


var authController = require('../controllers/auth');
var userController = require('../controllers/user');
var adController = require('../controllers/activedirectory');


router.route('/')
    .get(function (req, res) {
        res.json({
            message: "Successfully connected to mybit API."
        })
    });


//Session Routes
router.route('/Auth')
    .post(authController.generateToken);

router.route('/Auth/Refresh')
    .get(authController.refreshToken);

// User Routes
router.route('/User')
    .get(userController.getUser)
    .post(userController.postUser);
//.delete(userController.deleteUser);

router.use(authController.verifyToken);

// AD Routes
router.route('/AD/GetAllUsers')
    .get(adController.getAllUsers);

router.route('/AD/GetTeams')
    .get(adController.getTeams);

router.route('/AD/GetTeamMembers')
    .get(adController.getTeamMembers);

// CMX Routes
router.route('/CMX/GetLocation')
    .get(function(req, res){
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

    })



// Dummy routes for testing purposes.
router.route('/Dummy/GetLocation')
    .get(function (req, res) {
        res.json({
            coordinates: {x: 0, y: 0},
            floor: 4,
            orientation: "West"
        })
    });


exports.getJSON = function(options, onResult)
{
    console.log("rest::getJSON");

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};

module.exports = router;
