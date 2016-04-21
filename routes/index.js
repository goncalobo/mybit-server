var express = require('express');
var router = express.Router();

var authController = require('../controllers/auth');
var userController = require('../controllers/user');


router.route('/')
    .get(function (req, res) {
        res.json({
            message: "Successfully connected to mybit API."
        })
    });

router.route('/User/Authenticate')
    .post(authController.authUser);

// User Routes
router.route('/User')
    .get(userController.getUser)
    .post(userController.postUser);
    //.delete(userController.deleteUser);


// Dummy routes for testing purposes.
router.route('/Dummy/GetLocation')
    .get(function (req, res) {
        res.json({
            coordinates: {x: 0, y: 0},
            floor: 4,
            orientation: "West"
        })
    });

module.exports = router;
