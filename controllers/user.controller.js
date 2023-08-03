const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const verifyToken = require('./authentication');
const pool = require('../config/pool-config');

const userCtrl = {};

userCtrl.createUser = async (req, res) => {
    console.log(req.body);

    const { name, email, age, location, pic_url, description, password } = req.body;

    try {
        // Realizar la inserción en la base de datos
        await pool.query(
            'INSERT INTO users (name, email, age, location, pic_url, description, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [name, email, age, location, pic_url, description, password],
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
    } catch(err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

userCtrl.deleteUser = async (req, res) => {
    let userId = req.query.id;
    let update = {
        name: null,
        email: 'deletedEmail',
        age: 0, location, pic_url, description, password
    };

    try {
        // Realizar la inserción en la base de datos
        await pool.query(
            'DELETE FROM users WHERE id = ' + userId,
            (error, result) => {
            if (error) {
                console.error('Error al eliminar usuario:', error);
                return res.status(500).json({ error: 'Error del servidor' });
            }
            res.status(200).json({ message: 'Usuario eliminado exitosamente' });
            }
        );
    } catch(err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

module.exports = userCtrl;