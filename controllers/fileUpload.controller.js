const pool = require('../config/pool-config');
const path = require('path');

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

fileUploadCtrl.download = async (req, res) => {
    try {
        const fileId = req.params.id;

        if (!fileId) {
            return res.status(400).json({ error: 'ID de archivo no proporcionado.' });
        }

        const query = 'SELECT name, type, size, route FROM files WHERE id = $1';
        const result = await pool.query(query, [fileId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Archivo no encontrado.' });
        }

        const fileData = result.rows[0];
        const filePath = path.join(__dirname, '..', fileData.route.replace(/\\/g, '/'));

        // Configurar los encabezados de respuesta
        res.setHeader('Content-Type', fileData.type);
        res.setHeader('Content-Disposition', `inline; filename="${fileData.name}"`);

        // Envía el archivo como respuesta
        res.sendFile(filePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al descargar el archivo.' });
    }
};



fileUploadCtrl.getImage = async (req, res) => {
        try {
            const fileId = req.params.id; // Cambia esto según cómo obtengas el ID del archivo
            if (!fileId) {
                return res.status(400).json({ error: 'ID de archivo no proporcionado.' });
            }
    
            const query = 'SELECT name, type, size, route FROM files WHERE id = $1';
            const result = await pool.query(query, [fileId]);
    
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Archivo no encontrado.' });
            }
    
            const fileData = result.rows[0];
            const filePath = fileData.ruta;
    
            // Agrega la URL del archivo en la respuesta
            fileData.url = `http://localhost:3000/fileUpload/media/${fileId}`;
    
            res.status(200).send(fileData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al descargar el archivo.' });
        }
    
};

module.exports = fileUploadCtrl;