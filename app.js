const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configura la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Amiwitos_bbdd',
  password: 'Ch1c2l3t4',
  port: 5432,
});

// Manejo de errores para la pool de conexiones
pool.on('error', (err) => {
  console.error('Error en la pool de conexiones:', err);
});

app.get('/', (req, res) => {
  pool.query('SELECT NOW()', (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      return res.status(500).json({ error: 'Error del servidor' });
    }
    res.send('¡Hola desde el backend con PostgreSQL!');
  });
});

app.post('/usuarios', (req, res) => {
  // Obtener los datos enviados en el cuerpo de la solicitud
  const { nombre, email, edad, ubicacion, foto_url, descripcion } = req.body;

  // Realizar la inserción en la base de datos
  pool.query(
    'INSERT INTO usuarios (nombre, email, edad, ubicacion, foto_url, descripcion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [nombre, email, edad, ubicacion, foto_url, descripcion],
    (error, result) => {
      if (error) {
        console.error('Error al insertar usuario:', error);
        return res.status(500).json({ error: 'Error del servidor' });
      }

      // El usuario se ha insertado correctamente, y el ID generado se encuentra en result.rows[0].id
      const nuevoUsuarioId = result.rows[0].id;
      res.status(201).json({ id: nuevoUsuarioId, message: 'Usuario creado exitosamente' });
    }
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
