const sqlite3 = require('sqlite3')
var db = new sqlite3.Database('./data.db')
const crypto = require('crypto')
const dotenv = require('dotenv');
dotenv.config();

let nombre = "Diego Molina"
let direccion = "Cra 28 # 68 - 41"
let telefono = "3657946"
let usuario = "admin"
let pass = "abcd1234"
let correo = "diego@test.com"
db.serialize(function() {
    db.run(`INSERT INTO usuario (nombre,direccion,telefono,usuario,pass,correo)
            VALUES ("${nombre}","${direccion}","${telefono}","${usuario}",
            "${ crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(pass).digest('hex') }",
            "${correo}");`)
})


db.close()
