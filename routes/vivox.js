const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const { getVivoxUserUri, getVivoxChannelUri, generateVivoxToken } = require('../utils/vivox');

/**
 * POST /api/vivox/token
 * Generate Vivox token for login or room join actions.
 * Body: { userId, userName, roomId, action }
 */
router.post('/token', async (req, res, next) => {
  try {
    const { userId, userName, roomId, action } = req.body || {};

    // 1. Action validation
    if (!action || (action !== 'login' && action !== 'join')) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid Vivox action'
      });
    }

    // 2. userId validation
    if (!userId || String(userId).trim() === '') {
      return res.status(400).json({
        ok: false,
        message: 'userId is required'
      });
    }

    const formattedUserId = String(userId).trim().toUpperCase();

    // 3. Handle 'login' action
    if (action === 'login') {
      console.log(`[Vivox] Login token request for user: ${formattedUserId}`);

      const user = await User.findOne({ userId: formattedUserId });
      if (!user) {
        console.log(`[Vivox] Login failed: User ${formattedUserId} not found`);
        return res.status(404).json({
          ok: false,
          message: 'User not found'
        });
      }

      // Use authoritative userId for Vivox user identity
      const vivoxUserUri = getVivoxUserUri(user.userId);

      let token;
      try {
        token = generateVivoxToken({
          userUri: vivoxUserUri,
          action: 'login'
        });
      } catch (err) {
        console.error('[Vivox] Login token generation error:', err.message);
        return res.status(500).json({
          ok: false,
          message: 'Vivox service configuration error'
        });
      }

      console.log(`[Vivox] Login token generated successfully for user: ${formattedUserId}`);

      return res.json({
        ok: true,
        token,
        userUri: vivoxUserUri
      });
    }

    // 4. Handle 'join' action
    if (action === 'join') {
      if (!roomId || String(roomId).trim() === '') {
        return res.status(400).json({
          ok: false,
          message: 'roomId is required'
        });
      }

      const formattedRoomId = String(roomId).trim().toUpperCase();
      console.log(`[Vivox] Join token request for room: ${formattedRoomId}, user: ${formattedUserId}`);

      const room = await Room.findOne({ roomId: formattedRoomId });
      if (!room) {
        console.log(`[Vivox] Join token failed: Room ${formattedRoomId} not found`);
        return res.status(404).json({
          ok: false,
          message: 'Room not found'
        });
      }

      if (room.status === 'finished') {
        console.log(`[Vivox] Join token rejected: Room ${formattedRoomId} is finished`);
        return res.status(403).json({
          ok: false,
          message: 'Room is already finished'
        });
      }

      // Verify room membership
      const player = room.players && room.players.find(p => String(p.userId).toUpperCase() === formattedUserId);
      if (!player) {
        console.log(`[Vivox] Unauthorized token request: User ${formattedUserId} is not a member of room ${formattedRoomId}`);
        return res.status(403).json({
          ok: false,
          message: 'User is not a member of this room'
        });
      }

      console.log(`[Vivox] Room membership verified for user: ${formattedUserId} in room: ${formattedRoomId}`);

      // Use authoritative userId for Vivox user identity
      const vivoxUserUri = getVivoxUserUri(player.userId);
      const vivoxChannelUri = room.vivoxChannelUri || getVivoxChannelUri(formattedRoomId);

      let token;
      try {
        token = generateVivoxToken({
          userUri: vivoxUserUri,
          action: 'join',
          targetUri: vivoxChannelUri
        });
      } catch (err) {
        console.error('[Vivox] Join token generation error:', err.message);
        return res.status(500).json({
          ok: false,
          message: 'Vivox service configuration error'
        });
      }

      console.log(`[Vivox] Join token generated successfully for user: ${formattedUserId} in room: ${formattedRoomId}`);

      return res.json({
        ok: true,
        token,
        userUri: vivoxUserUri,
        channelUri: vivoxChannelUri
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
