const Period = require('../models/period');

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await Period.findAll();
    res.status(200).json(periods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des périodes' });
  }
};

exports.getPeriodById = async (req, res) => {
  const { id } = req.params;
  try {
    const period = await Period.findByPk(id);
    if (period) {
      res.status(200).json(period);
    } else {
      res.status(404).json({ message: 'Période non trouvée' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la période' });
  }
};

exports.createPeriod = async (req, res) => {
  try {
    const newPeriod = await Period.create(req.body);
    res.status(201).json(newPeriod);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de la période' });
  }
};

exports.updatePeriod = async (req, res) => {
  const { id } = req.params;
  try {
    const [updatedRowsCount, updatedPeriods] = await Period.update(req.body, {
      where: { id },
      returning: true
    });
    if (updatedRowsCount > 0) {
      const updatedPeriod = updatedPeriods[0];
      res.status(200).json(updatedPeriod);
    } else {
      res.status(404).json({ message: 'Période modifié' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la période' });
  }
};

exports.deletePeriod = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRows = await Period.destroy({
      where: { id },
    });
    if (deletedRows > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ message: 'Période non trouvée' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la période' });
  }
};