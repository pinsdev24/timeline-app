const Event = require('../models/event');
const fetch = require('node-fetch'); 

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json(events); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
};

exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByPk(id);
    if (event) {
      res.status(200).json(event); 
    } else {
      res.status(404).json({ message: 'Événement non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const [updatedRowsCount, updatedEvents] = await Event.update(req.body, { 
      where: { id },
      returning: true, 
    });

    if (updatedRowsCount > 0) {
      const updatedEvent = updatedEvents[0];
      res.status(200).json(updatedEvent); 
    } else {
      res.status(404).json({ message: 'Événement modifié' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRows = await Event.destroy({
      where: { id },
    });
    if (deletedRows > 0) {
      res.status(204).end(); 
    } else {
      res.status(404).json({ message: 'Événement non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
  }
};


exports.getMediasByEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    
    const response = await fetch(`http://localhost:3001/medias/by-event/${eventId}`);
    if (!response.ok) {
      return res.status(response.status).json({ message: `Erreur lors de la récupération des médias: ${response.statusText}` }); // Inclure le message d'erreur de la réponse
    }
    const medias = await response.json();
    res.status(200).json(medias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des médias par événement' });
  }
};


exports.getMediasByPeriod = async (req, res) => {
  const { periodId } = req.params;
  try {
    
    const events = await Event.findAll({ where: { period_id: periodId } }); 
    const eventIds = events.map(event => event.id);

    if (eventIds.length === 0) {
      return res.status(200).json([]); 
    }

    
    const response = await fetch('http://localhost:3001/medias/by-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventIds }),
    });

    if (!response.ok) {
       return res.status(response.status).json({ message: `Erreur lors de la récupération des médias: ${response.statusText}` });
    }
    const medias = await response.json();
    res.status(200).json(medias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des médias par période' });
  }
};
