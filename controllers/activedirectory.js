var ActiveDirectory = require('activedirectory');
var ADConfig = require('../config.js').activeDirectoryConfig;
var AD = new ActiveDirectory(ADConfig);

exports.getTeams = function (req, res) {
    var userName = req.query.username;

    AD.getGroupMembershipForUser(userName, function (err, groups) {
        if(err) {
            res.send({
                message: "ERROR",
                error: err
            })
        }

        var result = [];

        if(!groups)
            console.log('Teams: ' + userName + ' not found.');
        else {
            for (var group in groups)
                if(groups[group].dn.includes("Grupos Gerais"))
                    result.push({"CN":groups[group].cn,"Description":groups[group].description})
            res.contentType('application/json');
            res.send(JSON.stringify(result));
        }
    })
}

exports.getTeamMembers = function (req, res) {
    var groupName = req.query.team;

    AD.getUsersForGroup(groupName, function(err, users) {
        if (err) {
            console.log('ERROR: ' +JSON.stringify(err));
            return;
        }

        var result = [];

        if (! users)
            console.log('Group: ' + groupName + ' not found.');
        else {
            for (var user in users)
                    result.push({"ID":users[user].sAMAccountName,"Name":users[user].givenName})
            res.contentType('application/json');
            res.send(JSON.stringify(result));
        }
    });
}

exports.getAllUsers = function (req, res) {

    ADConfig.baseDN = ADConfig.usersBaseDN;

    var AD = new ActiveDirectory(ADConfig);

    AD.findUsers(function(err, users) {
        if (err) {
            console.log('ERROR: ' +JSON.stringify(err));
            return;
        }

       // res.send(users);

        var result = [];

        if ((! users) || (users.length == 0)) console.log('No users found.');
        else {
            console.log('findUsers: '+JSON.stringify(users));
            for (var user in users)
             if(users[user].dn.includes(ADConfig.usersOU))
                 result.push({"ID":users[user].sAMAccountName,"Name":users[user].givenName})
            res.contentType('application/json');
            res.send(JSON.stringify(result));
        }
    });
}

