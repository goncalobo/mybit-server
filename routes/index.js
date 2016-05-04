var https = require("https");
var express = require('express');

var cmxConfig = require('../config').cmxConfig;

var router = express.Router();


var authController = require('../controllers/auth');
var userController = require('../controllers/user');


router.route('/')
.get(function (req, res) {
    res.json({
        message: "Successfully connected to mybit API."
    })
});


//Session Routes
router.route('/Auth')
.post(authController.generateToken);

router.route('/Auth/refresh')
.get(authController.refreshToken);

// User Routes
router.route('/User')
.get(userController.getUser)
.post(userController.postUser);
    //.delete(userController.deleteUser);


    router.use(authController.verifyToken);


// CMX Routes
router.route('/CMX/GetTotalActive')
.get(function(req, res){
    var options = {
        host: cmxConfig.host,
        port: cmxConfig.port,
        path: '/api/location/v2/clients/count',
        method: 'GET',
        rejectUnauthorized: false,
    headers: {
            'Content-Type': 'application/json',
            'Authorization': cmxConfig.auth
        }
    }

req = https.request(options, function(result)
{
    result.setEncoding('utf8');

    result.on('data', function (chunk)
    {
        var totalActive = JSON.parse(chunk);
        res.json({"TotalActive":totalActive.count});
    });

    result.on('end', function(result)
    {
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
