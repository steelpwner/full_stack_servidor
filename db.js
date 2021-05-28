const sqlite3 = require('sqlite3')
var db = new sqlite3.Database('./data.db')

db.serialize(function() {
    db.run(`CREATE TABLE usuario (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                direccion TEXT NOT NULL,
                telefono TEXT NOT NULL,
                usuario TEXT NOT NULL,
                pass TEXT NOT NULL,
                correo TEXT NOT NULL
            );
            CREATE UNIQUE INDEX usuario_unique_email ON usuario(correo);
            CREATE UNIQUE INDEX usuario_unique_usuario ON usuario(usuario);
            `)
    db.run("DROP TABLE noticia")
    db.run(`CREATE TABLE noticia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            periodista TEXT NOT NULL,
            visible TINYINT NOT NULL DEFAULT 1,
            categoria TEXT NOT NULL,
            imagen TEXT NOT NULL,
            resumen TEXT NOT NULL,
            fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            usuario BIGINT NOT NULL,
            FOREIGN KEY (usuario)
                REFERENCES usuario(id)
            )
            `);
})

db.close()

