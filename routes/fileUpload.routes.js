const express = require('express');
const router = express.Router();
const token = require('../controllers/authentication');
const fileUpload = require('../controllers/fileUpload.controller');
const multer = require('multer');
const path = require('path');
const multerConfig = require('../multer/multer-config');

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage });

router.post('/upload', upload.single('file'), fileUpload.upload);

module.exports = router;