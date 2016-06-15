var express = require('express');

var router = express.Router();

var authController = require('../controllers/auth');
var adController = require('../controllers/activedirectory');
var cmxController = require('../controllers/cmx');
var bookingController = require('../controllers/booking');
var kpiController = require('../controllers/kpi');
var notificationsController = require('../controllers/notifications');

router.route('/')
    .get(function(req, res) {
        res.json({
            message: "Successfully connected to mybit API."
        })
    });

//Auth Routes
router.route('/Auth')
    .post(authController.generateToken);
router.route('/Auth/Refresh')
    .get(authController.refreshToken);
router.use(authController.verifyToken);
router.route('/Auth')
    .get(authController.getUser);

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
router.route('/Booking')
    .post(bookingController.BookRoom);
router.route('/Booking/GetRooms')
    .get(bookingController.getRooms);
router.route('/Booking/GetAvailability')
    .post(bookingController.getAvailability);
router.route('/Booking/GetScheduledMeetings')
    .post(bookingController.getScheduledMeetings);

// KPI
router.route('/KPI/GetRoomStats/:query')
    .get(kpiController.roomStats);
router.route('/KPI/GetAppStats')
    .get(kpiController.applicationStats);
router.route('/KPI/GetAppStats/:query/:period')
    .get(kpiController.applicationStatsQuery);
router.route('/KPI/GetInflowStats/:query/:time')
    .get(kpiController.inflowStats);

// Notifications
router.route('/Notify')
    .post(notificationsController.notify);

module.exports = router;
