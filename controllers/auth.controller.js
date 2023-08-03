const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const verifyToken = require('./authentication');
const { Pool } = require('pg');

const authCtrl = {};

authCtrl.login = async (req, res) => {
    console.log(req.body);
    await pool.query(
        'SELECT * FROM usuarios WHERE email = ' + req.body.email,
        (error, result) => {
            if (error) {
                console.log(error.message);
            }
            if (!result) {
                res.status(404).send('User not found');
            } else if (req.body.password != result.password) {
                return res.status(401).send({ auth: false, token: null });
            } else {
                const token = jwt.sign({ user: result}, config.secret, { expiresIn: 60*60*24*365 });
                res.send({ auth: true, token });
            }
        }
    )
};

authCtrl.logout = async (req, res) => {
    res.status(200).send({ auth: false, token: null });
};

module.exports = authCtrl;