const express = require('express');
const User = require('../models/User');
const router = express.Router();

/**
 * POST /api/users
 * Create or update user profile with name, gmailId, and deviceId.
 */
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

/**
 * GET /api/users/device/:deviceId
 * Search and fetch user profile details by deviceId.
 */
router.get('/device/:deviceId', async (req, res, next) => {
  try {
    const deviceId = String(req.params.deviceId || '').trim();
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const user = await User.findOne({ deviceId }).select('-__v').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found for this deviceId' });
    }

    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/users/gmail/:gmailId
 * Search and fetch user profile details by gmailId.
 */
router.get('/gmail/:gmailId', async (req, res, next) => {
  try {
    const gmailId = String(req.params.gmailId || '').trim().toLowerCase();
    if (!gmailId) {
      return res.status(400).json({ error: 'gmailId is required' });
    }

    const user = await User.findOne({ gmailId }).select('-__v').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found for this gmailId' });
    }

    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/users
 * Search user by query param (e.g. /api/users?deviceId=device_123 or /api/users?gmailId=user@gmail.com)
 */
router.get('/', async (req, res, next) => {
  try {
    const { deviceId, gmailId } = req.query;

    const filter = {};
    if (deviceId) filter.deviceId = String(deviceId).trim();
    if (gmailId) filter.gmailId = String(gmailId).trim().toLowerCase();

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        error: 'Please provide query parameters deviceId or gmailId to search users (e.g., /api/users?deviceId=YOUR_DEVICE_ID)'
      });
    }

    const user = await User.findOne(filter).select('-__v').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found matching search criteria' });
    }

    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
