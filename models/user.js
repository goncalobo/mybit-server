var sql = require('seriate');

var findUser = function (username) {
    //sql.execute(...);
    return {
        id: 0,
        email: "user@sonae.pt",
        fullname: "John Smith"
    }
}

var insertUser = function(email, password) {
    return sql.execute( {
        query: sql.fromFile('../sql/insertUser'),
        params: {
            email : email,
            password : password
        }
    } )
};

module.exports = {
    findUser: findUser,
    insertUser: insertUser
};