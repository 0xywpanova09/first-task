const express = require('express');
const CheckIn = require('../models/CheckIn');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const checkins = await CheckIn.find().sort({ createdAt: -1 }).limit(100);
    res.json(checkins);
  } catch (error) {
    console.error('Failed to fetch check-ins:', error);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, mood, workedOn, blockers } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!mood || typeof mood !== 'string' || !mood.trim()) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const allowedMoods = ['1', '2', '3', '4', '5', 'Good', 'Okay', 'Bad'];
    if (!allowedMoods.includes(mood.trim())) {
      return res.status(400).json({
        error: 'Mood must be 1-5 or Good / Okay / Bad',
      });
    }

    const checkIn = await CheckIn.create({
      name: name.trim(),
      mood: mood.trim(),
      workedOn: typeof workedOn === 'string' ? workedOn.trim() : '',
      blockers: typeof blockers === 'string' ? blockers.trim() : '',
    });

    res.status(201).json(checkIn);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({ error: message });
    }
    console.error('Failed to create check-in:', error);
    res.status(500).json({ error: 'Failed to create check-in' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid check-in id' });
    }

    const deleted = await CheckIn.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    res.json({ message: 'Check-in deleted', id: deleted._id });
  } catch (error) {
    console.error('Failed to delete check-in:', error);
    res.status(500).json({ error: 'Failed to delete check-in' });
  }
});

module.exports = router;
