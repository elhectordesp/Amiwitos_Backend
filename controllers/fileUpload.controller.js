const pool = require('../config/pool-config');

const fileUploadCtrl = {};

fileUploadCtrl.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo para subir.' });
        }

        const { filename, mimetype, size } = req.file;
        const filePath = req.file.path;

        const query = 'INSERT INTO files (name, type, size, route) VALUES ($1, $2, $3, $4)';
        await pool.query(query, [filename, mimetype, size, filePath]);

        res.status(201).json({ message: 'Archivo subido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir el archivo.' });
    }
};

module.exports = fileUploadCtrl;