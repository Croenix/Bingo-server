const User = require('../models/User');
const { generateUniqueUserId } = require('./userIdGenerator');
const { generateDefaultAvatar } = require('./avatarGenerator');

/**
 * Migration helper to backfill missing userId fields for legacy users.
 */
async function migrateLegacyUsers() {
  try {
    const unmigratedUsers = await User.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: '' }
      ]
    });

    if (unmigratedUsers.length === 0) {
      return;
    }

    console.log(`[Migration] Found ${unmigratedUsers.length} user(s) missing unique userId. Starting backfill...`);
    let migratedCount = 0;

    for (const user of unmigratedUsers) {
      const newUserId = await generateUniqueUserId(User);
      user.userId = newUserId;
      if (!user.profileImageUrl) {
        user.profileImageUrl = generateDefaultAvatar(newUserId);
      }
      await user.save();
      migratedCount++;
    }

    console.log(`[Migration] Successfully migrated ${migratedCount} legacy user(s) with new unique User IDs.`);
  } catch (err) {
    console.error('[Migration Error] Failed to migrate legacy users:', err.message);
  }
}

module.exports = migrateLegacyUsers;
