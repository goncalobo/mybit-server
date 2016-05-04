var User = require('../models/user');

exports.getUser = function(req, res) {
    res.json(
        User.findUser(req.body.email)
    );
};

exports.postUser = function(req, res) {
    res.json(
        User.insertUser(req.body.email, function(err) {
        if (err) {
            res.send(err);
        }
        res.json({ message: 'User created with email: ' + req.body.email + '.' });
    }))
};