const crypto = require("crypto");
const path = require("path");
//const debug = require( 'debug' )( 'utils' );

function _md5(message) {
  let hash = crypto.createHash("md5");
  hash.update(message);
  return hash.digest("hex");
}

/**
 * Sanitizes a filename to prevent path traversal attacks
 * @param {string} filename - The filename to sanitize
 * @returns {string} - The sanitized filename
 * @throws {Error} - If the filename contains path traversal patterns
 */
function _sanitizeFilename(filename) {
  if (!filename || typeof filename !== "string") {
    throw new Error("Invalid filename provided");
  }

  // Check for null bytes
  if (filename.includes("\0")) {
    throw new Error("Invalid filename provided");
  }

  // Sanitize fileName to prevent path traversal attacks
  // Use path.normalize and path.basename to ensure only the filename is used
  const sanitizedFileName = path.basename(path.normalize(filename));

  // Reject if the normalized path differs significantly from the original
  // This catches path separators or path traversal (.., ../, ..%, etc.)
  if (
    !sanitizedFileName ||
    sanitizedFileName !== filename ||
    /[/\\]|\.\./.test(filename)
  ) {
    throw new Error("Invalid file provided");
  }

  return sanitizedFileName;
}

module.exports = {
  md5: _md5,
  sanitizeFilename: _sanitizeFilename,
};
