require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT_MEDIAS || 3001;

app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        fs.mkdir(uploadPath, { recursive: true })
            .then(() => cb(null, uploadPath))
            .catch(err => cb(err));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4();
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });


app.post('/medias/upload/:eventId', upload.single('mediaFile'), async (req, res) => {
    const { eventId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé.' });
    }

    try {
        const { filename, path: filePath, mimetype } = req.file;

        
        const newMedia = await sequelize.models.Media.create({
            event_id: eventId,
            url: filePath,
            mime_type: mimetype,
            text: req.body.text || '',
            fileName: filename,
        });

        res.status(201).json(newMedia);
    } catch (error) {
        console.error('Erreur lors de l\'upload et de l\'enregistrement du média:', error);
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
                console.log(`Fichier supprimé à cause d'une erreur: ${req.file.path}`);
            } catch (unlinkError) {
                console.error('Erreur lors de la suppression du fichier après une erreur d\'upload:', unlinkError);
            }
        }
        res.status(500).json({ message: 'Erreur lors de l\'upload du média.' });
    }
});

app.get('/medias', async (req, res) => {
    try {
        const medias = await sequelize.models.Media.findAll();
        res.status(200).json(medias);
    } catch (error) {
        console.error('Erreur lors de la récupération des médias:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des médias.' });
    }
});

app.get('/medias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const media = await sequelize.models.Media.findByPk(id);
        if (media) {
            res.status(200).json(media);
        } else {
            res.status(404).json({ message: 'Média non trouvé.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du média:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du média.' });
    }
});

app.delete('/medias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const media = await sequelize.models.Media.findByPk(id);
        if (!media) {
            return res.status(404).json({ message: 'Média non trouvé.' });
        }
        try {
            await fs.unlink(media.url);
            console.log(`Fichier supprimé: ${media.url}`);
        } catch (fileError) {
            console.error('Erreur lors de la suppression du fichier:', fileError);
        }
        await sequelize.models.Media.destroy({
            where: { id },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Erreur lors de la suppression du média:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du média.' });
    }
});

app.get('/medias/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Le paramètre de recherche "query" est requis.' });
    }
    try {
        const medias = await sequelize.models.Media.findAll({
            where: {
                fileName: {
                    [Sequelize.Op.like]: `%${query}%`,
                },
            },
        });
        res.status(200).json(medias);
    } catch (error) {
        console.error('Erreur lors de la recherche des médias:', error);
        res.status(500).json({ message: 'Erreur lors de la recherche des médias.' });
    }
});

app.get('/medias/by-event/:eventId', async (req, res) => {
    const { eventId } = req.params;
    try {
        const medias = await sequelize.models.Media.findAll({
            where: { event_id: eventId },
        });
        res.status(200).json(medias);
    } catch (error) {
        console.error('Erreur lors de la récupération des médias par événement:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des médias par événement.' });
    }
});

app.post('/medias/by-events', async (req, res) => {
    const { eventIds } = req.body;
    if (!Array.isArray(eventIds) || eventIds.length === 0) {
        return res.status(400).json({ message: 'Le tableau "eventIds" est requis dans le corps de la requête.' });
    }
    try {
        const medias = await sequelize.models.Media.findAll({
            where: {
                event_id: {
                    [Sequelize.Op.in]: eventIds,
                },
            },
        });
        res.status(200).json(medias);
    } catch (error) {
        console.error('Erreur lors de la récupération des médias par événements:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des médias par événements.' });
    }
});


const periodRoutes = require('./routes/periodRoutes');
const eventRoutes = require('./routes/eventRoutes');
app.use('/periods', periodRoutes);
app.use('/events', eventRoutes);


sequelize.sync()
    .then(() => {
        console.log('Base de données synchronisée.');
        const server = app.listen(PORT, () => {
            console.log(`Microservice démarré sur le port ${PORT}`);
        });
        server.on('error', (error) => {
            console.error('Erreur du serveur Express:', error);
            process.exit(1);
        });
    })
    .catch(err => {
        console.error('Erreur de synchronisation de la base de données:', err);
        process.exit(1);
    });
