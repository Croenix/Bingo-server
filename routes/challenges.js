const express = require('express');
const Challenge = require('../models/Challenge');
const router = express.Router();

// GET /api/challenges - Get active challenges for game client
router.get('/', async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ challenges });
  } catch (e) {
    next(e);
  }
});

// GET /api/challenges/:id - Get challenge details
router.get('/:id', async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json({ challenge });
  } catch (e) {
    if (e.name === 'CastError') return res.status(400).json({ error: 'Invalid challenge ID' });
    next(e);
  }
});

module.exports = router;
