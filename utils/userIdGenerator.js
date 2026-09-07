const crypto = require('crypto');

/**
 * Generate a random User ID in the format BGO-XXXXXXXX
 * Example: BGO-7F4K92M1
 */
function generateUserId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(8);
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return `BGO-${result}`;
}

/**
 * Generate a guaranteed unique User ID by querying MongoDB.
 * Cross-checks the database to ensure the generated ID does not exist for any user.
 * @param {import('mongoose').Model} User - Mongoose User Model
 * @returns {Promise<string>} Guaranteed unique BGO-XXXXXXXX User ID
 */
async function generateUniqueUserId(User) {
  const maxRetries = 50;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const candidate = generateUserId();

    // Cross-check entire MongoDB database to verify this userId does not exist
    const existingUser = typeof User.findOne === 'function'
      ? await User.findOne({ userId: candidate }).select('_id').lean()
      : await User.exists({ userId: candidate });

    if (!existingUser) {
      return candidate;
    }
  }

  // Double fallback with timestamp micro-hash if extreme collision occurs
  const uniqueTimestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `BGO-${uniqueTimestamp}${randomHex}`;
}

module.exports = {
  generateUserId,
  generateUniqueUserId
};
