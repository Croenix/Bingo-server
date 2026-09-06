const crypto = require('crypto');

function base64url(input) {
  const buffer = Buffer.isBuffer(input)
    ? input
    : Buffer.from(typeof input === 'string' ? input : JSON.stringify(input));
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Returns the formatted Vivox User SIP URI.
 * Format: sip:.{issuer}.{username}.@{domain}
 */
function getVivoxUserUri(username) {
  const issuer = process.env.VIVOX_ISSUER || 'bingo1234-vi0';
  const domain = process.env.VIVOX_DOMAIN || 'v3.vivox.com';
  const safeUsername = String(username).replace(/[^a-zA-Z0-9_\-\.]/g, '');
  return `sip:.${issuer}.${safeUsername}.@${domain}`;
}

/**
 * Returns the formatted Vivox Channel SIP URI.
 * Format: sip:confctl-g-{issuer}.{channelName}@{domain}
 */
function getVivoxChannelUri(channelName) {
  const issuer = process.env.VIVOX_ISSUER || 'bingo1234-vi0';
  const domain = process.env.VIVOX_DOMAIN || 'v3.vivox.com';
  const safeChannel = String(channelName).replace(/[^a-zA-Z0-9_\-\.]/g, '');
  return `sip:confctl-g-${issuer}.${safeChannel}@${domain}`;
}

let vxiCounter = 100;

/**
 * Generates Vivox Access Token (VAT) for authentication & voice channel actions.
 * @param {Object} params
 * @param {string} params.userUri - The SIP URI of the user requesting access.
 * @param {string} [params.action='join'] - Vivox action ('login', 'join', etc.)
 * @param {string} [params.targetUri] - Channel SIP URI (required for join action)
 * @param {number} [params.expirationSeconds=90] - Token expiration duration in seconds.
 * @returns {string} Signed Vivox Access Token
 */
function generateVivoxToken({ userUri, action = 'join', targetUri, expirationSeconds = 90 }) {
  const issuer = process.env.VIVOX_ISSUER || 'bingo1234-vi0';
  const secretKey = process.env.VIVOX_SECRET_KEY || 'bingo_vivox_secret_key_2026';

  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + expirationSeconds;
  vxiCounter += 1;

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    iss: issuer,
    sub: userUri,
    exp: expSec,
    vxa: action,
    vxi: vxiCounter,
    f: userUri
  };

  if (targetUri) {
    payload.t = targetUri;
  }

  const headerB64 = base64url(header);
  const payloadB64 = base64url(payload);
  const tokenData = `${headerB64}.${payloadB64}`;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(tokenData);
  const signatureB64 = hmac.digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${tokenData}.${signatureB64}`;
}

module.exports = {
  getVivoxUserUri,
  getVivoxChannelUri,
  generateVivoxToken
};
