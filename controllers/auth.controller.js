const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const verifyToken = require('./authentication');
const bcrypt = require('bcrypt');
const pool = require('../config/pool-config');

const authCtrl = {};

authCtrl.login = async (req, res) => {
    console.log(req.body);

    try {
        const query = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(query, [req.body.email]);

        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = result.rows[0];

        if (req.body.password != user.password) {
            return res.status(401).send({ auth: false, token: null });
        }

        const token = jwt.sign({ user }, config.secret, { expiresIn: '1y' });
        res.send({ auth: true, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

authCtrl.logout = async (req, res) => {
    res.status(200).send({ auth: false, token: null });
};

module.exports = authCtrl;