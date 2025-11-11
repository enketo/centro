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

  // Check for path traversal patterns
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw new Error("Invalid filename provided");
  }

  // Additional check: use path.normalize and ensure result doesn't escape intended directory
  const normalized = path.normalize(filename);
  if (normalized !== filename || normalized.includes("..")) {
    throw new Error("Invalid filename provided");
  }

  return filename;
}

module.exports = {
  md5: _md5,
  sanitizeFilename: _sanitizeFilename,
};
