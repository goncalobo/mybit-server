var express = require('express');

var router = express.Router();

var authController = require('../controllers/auth');
var userController = require('../controllers/user');
var adController = require('../controllers/activedirectory');
var cmxController = require('../controllers/cmx');
var bookingController = require('../controllers/booking');


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
    .get(cmxController.getLocation);

// Booking Routes
router.route('/Booking/GetRooms')
    .get(bookingController.getRooms);

router.route('/Booking/GetEWSRooms')
    .get(bookingController.getEWSRooms);

router.route('/Booking/TestEWS')
    .get(bookingController.testEWS);

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
