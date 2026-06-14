const { nanoid } = require('nanoid');
const Url = require('../models/Url');

/**
 * Generates a unique 6-character URL-safe short code.
 * Retries on the rare collision — probability is ~1 in 68 billion per attempt.
 */
async function generateUniqueCode() {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid(6);
    exists = await Url.exists({ shortCode: code });
  }

  return code;
}

module.exports = { generateUniqueCode };
