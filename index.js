const express = require('express')
const jwt = require('jsonwebtoken')
var cors = require('cors')
const crypto = require('crypto')
const sqlite3 = require('sqlite3').verbose()
const dotenv = require('dotenv');
dotenv.config();
const file = "./data.db"
const port = 4000
const app = express()
const cookieParser = require("cookie-parser");

var db = new sqlite3.Database(file)
app.use(cors())
app.use(express.json())
app.use(cookieParser())


const sessionTime = 1800

authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
  
      req.user = user
  
      next()
    })
}

validateEmail = (mail) => {
 if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail))
  {
    return true
  }
    return false
}

validatePhone = (value) => {
    return value.match(/\d/g) != null && (value.match(/\d/g).length===10 || value.match(/\d/g).length===7)
}

validateUserInput = (req, res, next) => {
    params = ["name","address","phone","user","pass","email"]
    names = req.body
    for (i = 0; i < params.length; i++) {
        if (!Object.keys(names).includes(params[i])) {
            return res.status(200).json({"status":422,"message":"Faltaron parámetros para la función"})
        }
    }
    if (!validateEmail(req.body.email) || !validatePhone(req.body.phone)) {
        return res.status(200).json({"status":422,"message":"Hubo un error al revisar el email o el teléfono, por favor verifíquelos."})
    }
    next()
}

generateAccessToken = (username) => {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: `${sessionTime}s`});
}

app.post("/login", (req, res) => {
  let sql = `SELECT nombre, direccion, telefono, usuario, correo FROM usuario WHERE usuario = "${req.body.user}" AND pass = "${crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(req.body.pass).digest('hex')}";`
  db.get(sql, [], (err,user) => {
  if (err) {
    res.status(400).json({error:err.message})
  }
  if (user) {
    token = generateAccessToken(user)
    res.status(200).json({"status":200,"token":token,"user":user,"sessionTime":sessionTime})
  } else {
    res.status(200).json({"status":401,"message":"Error en los datos suministrados."})
  }  
  })
})

app.post("/users/create", validateUserInput, (req, res) => {
    params = req.body
    sql = `SELECT COUNT(*) recount FROM usuario WHERE usuario = "${params.user}" OR correo = "${params.email}"`
    db.get(sql, [], (err,row) => {
        if (err) {
          res.status(200).json({"status":400,"error":err.message})
        }
        if (row['recount'] == 0) {
            sql = `INSERT INTO usuario (nombre,direccion,telefono,usuario,pass,correo)
            VALUES ("${params.name}","${params.address}","${params.phone}","${params.user}",
            "${ crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(params.pass).digest('hex')}",
            "${params.email}");`
            db.run(sql);
            return res.status(200).json({"status":200,"message":"Usuario creado correctamente"})
        } else {
            res.status(200).json({"status":409,"message":"El correo o usuario digitado ya existe en la base de datos."})
        }
    })
})


app.get("/news", (req, res) => {
    sql = "SELECT nombre, descripcion, periodista, visible, categoria, imagen, resumen, fecha_creacion FROM noticia WHERE visible = 1;"
    
})

app.get("/users/self", authenticateToken, (req, res) => {
    if (req.user != undefined) {
        res.send(req.user)
    } else {
        res.sendStatus(403)
    }
})

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => {
    console.log(`App corriendo en puerto ${port} en ip localhost`)
})