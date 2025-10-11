const crypto = require('crypto');

/**
 * Generate a UUID v4
 * @returns {string} UUID v4 string
 */
function generateUUID() {
  return crypto.randomUUID();
}

module.exports = { generateUUID };
