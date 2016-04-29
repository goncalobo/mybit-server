var express = require('express');
var jwt = require('jsonwebtoken');

var router = express.Router();

var authController = require('../controllers/auth');
var userController = require('../controllers/user');


router.route('/')
    .get(function (req, res) {
        res.json({
            message: "Successfully connected to mybit API."
        })
    });

// User Routes
router.route('/User')
    .get(userController.getUser)
    .post(userController.postUser);
    //.delete(userController.deleteUser);

// User Routes
router.route('/User/Auth')
    .post(authController.authUser)

router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, req.app.get('secret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

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
