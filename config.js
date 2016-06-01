module.exports = {
    sqlConfig : {
        name : "MYBITDB",
        port : "12345",
        server : "127.0.0.1",
        user : "sa",
        password : "Mybitdb_123",
        database : "mybitdb"
    },
    activeDirectoryConfig : {
        url: 'ldap://dcldap.mch.moc.sgps',
        baseDN: 'DC=mch,DC=moc,DC=sgps',
        usersBaseDN: 'OU=DSI,DC=mch,DC=moc,DC=sgps',
        username: 'FEUPUSER01@mch.moc.sgps',
        password: 'feup%01',
        usersOU: 'Matosinhos'
    },
    cmxConfig : {
        host: '10.126.73.43',
        port: 443,
        auth: 'Basic YWRtaW46Y2lzY28uY214'
    },
    secret: 'mybitsecretkey'
};