var sql = require('seriate');

var findUser = function (username) {
    //sql.execute(...);
    return {
        id: 0,
        email: "user@sonae.pt",
        fullname: "John Smith"
    }
}

var insertUser = function(email) {/*
    var token = '2L460fWm8XT1KUl1KK45b89rQANt7Bhs';
    var expires = new Date();
    return sql.execute( {
        query: sql.fromFile('../sql/insertUser'),
        params: {
            email :{
                type : sql.VARCHAR,
                val: email
            },
            token : {
                type : sql.VARCHAR,
                val : token
            },
            expires: {
                type : sql.DATETIME,
                val : expires
            }
        }
    } ).then( function( results ) {
        console.log( results );
    }, function( err ) {
        console.log( "Something bad happened:", err );
    } );
*/
};

module.exports = {
    findUser: findUser,
    insertUser: insertUser
};