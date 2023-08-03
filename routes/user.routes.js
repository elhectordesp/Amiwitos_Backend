const express = require('express');
const router = express.Router();
const token = require('../controllers/authentication');
const user = require('../controllers/user.controller');
const multer = require('multer');
const multerConfig = require('../multer/multer-config');

router.post('/', user.createUser);
router.put('/delete', token.verifyToken, token.verifyUser, user.deleteUser);

module.exports = router;