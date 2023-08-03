const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const auth = require('../controllers/auth.controller');
const config = require('../config/config');

router.post('/login', auth.login);
router.get('/logout', auth.logout);

module.exports = router;