const express = require('express');
const app = express();
const server = require('http').Server(app);
const morgan = require('morgan');
const CryptoJS = require('crypto-js');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const multer = require('multer');
const multerConfig = require('./multer/multer-config');
const expressSession = require('express-session');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.set('port', process.env.PORT | 3000);
app.set('json spaces', 2);

app.use((req, res, next) => {
  console.log(req.data);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Middlewares
app.use(morgan('dev')); // Para ver las peticiones por consola
app.use(express.json()); // Para entender los json
app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
  resave: false,
  saveUninitialized: true,
  secret: 'bla bla bla'
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/users', require('./routes/user.routes'));
app.use('/fileUpload', require('./routes/fileUpload.routes'));

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

app.listen(app.get('port'), () => {
  console.log(`Servidor escuchando en http://localhost:${app.get('port')}`);
});
