module.exports = {
    sqlConfig : {
        name : "MYBITDB",
        port : "3311",
        server : "127.0.0.1",
        user : "sa",
        password : "Mybitdb_123",
        database : "mybitdb"
    },
    activeDirectoryConfig : {
        url: '',
        baseDN: 'hostname dcldap.mch.moc.sgps',
        username: 'feupuser01',
        password: 'feup%01'
    },
    cmxConfig : {
        host: '10.126.73.43',
        port: 443,
        auth: 'Basic YWRtaW46Y2lzY28uY214'
    },
    secret: 'mybitsecretkey'
};