var sql = require('seriate');
var jwt = require('jsonwebtoken');

var findSession = function (token, res) {
    var expires = new Date();
    var result = [];
    return sql.execute( {
        query: sql.fromFile('../sql/findSession'),
        params: {
            token :{
                type : sql.VARCHAR,
                val: token
            }
        }
    } ).then( function( results ) {
        result = results;
    }, function( err ) {
        console.log( "Something bad happened:", err );
    } );
}

var createSession = function(username, secret) {

    //Verificar se os dados estao corretos
    var token = jwt.sign({username : username}, secret, {
                        expiresIn: "12 days" // expires in 3*24 hours
                    });
    console.log('\n JWT Token generated');
    return token;

    /*return sql.execute( {
        query: sql.fromFile('../sql/createSession'),
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
    } );*/
};


module.exports = {
    createSession : createSession,
    findSession : findSession
};