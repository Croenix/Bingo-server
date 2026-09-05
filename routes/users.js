const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const gmailId = String(req.body.gmailId || '').trim().toLowerCase();
    const deviceId = String(req.body.deviceId || '').trim();

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(gmailId)) {
      return res.status(400).json({ error: 'gmailId must be a valid Gmail address' });
    }

    const updateData = { name, gmailId };
    if (deviceId) updateData.deviceId = deviceId;

    const user = await User.findOneAndUpdate(
      { gmailId },
      updateData,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select('-__v');

    res.json({ message: 'User saved', user });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Gmail ID already exists' });
    next(e);
  }
});

module.exports = router;
