/* eslint-env mocha */

const chai = require("chai");
const expect = chai.expect;
const utils = require("../app/lib/utils");

describe("Path Traversal Protection", () => {
  describe("sanitizeFilename function", () => {
    it("should allow valid filenames", () => {
      const validFilenames = [
        "image.jpg",
        "document.pdf",
        "file123.txt",
        "my-file_name.png",
        "test.xml",
      ];

      validFilenames.forEach((filename) => {
        expect(() => utils.sanitizeFilename(filename)).to.not.throw();
        expect(utils.sanitizeFilename(filename)).to.equal(filename);
      });
    });

    it("should block path traversal attempts with ../", () => {
      const maliciousFilenames = [
        "../../../etc/passwd",
        "..\\..\\windows\\system32\\config\\sam",
        "file../other.txt",
        "..file.txt",
        "file..txt",
      ];

      maliciousFilenames.forEach((filename) => {
        expect(() => utils.sanitizeFilename(filename)).to.throw(
          "Invalid filename provided"
        );
      });
    });

    it("should block filenames with directory separators", () => {
      const maliciousFilenames = [
        "folder/file.txt",
        "folder\\file.txt",
        "/etc/passwd",
        "\\windows\\system32\\hosts",
        "some/path/to/file.jpg",
      ];

      maliciousFilenames.forEach((filename) => {
        expect(() => utils.sanitizeFilename(filename)).to.throw(
          "Invalid filename provided"
        );
      });
    });

    it("should block filenames with null bytes", () => {
      const maliciousFilenames = [
        "file.txt\0",
        "file\0.txt",
        "\0file.txt",
        "file.txt\0/../../../etc/passwd",
      ];

      maliciousFilenames.forEach((filename) => {
        expect(() => utils.sanitizeFilename(filename)).to.throw();
      });
    });

    it("should handle invalid input types", () => {
      const invalidInputs = [null, undefined, 123, {}, [], ""];

      invalidInputs.forEach((input) => {
        expect(() => utils.sanitizeFilename(input)).to.throw(
          "Invalid filename provided"
        );
      });
    });

    it("should block URL-encoded path traversal attempts", () => {
      const encodedMaliciousFilenames = [
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "file%2e%2e%2fother.txt",
      ];

      // Note: URL decoding should be handled by Express before reaching our sanitizer
      // These tests verify our sanitizer would catch already-decoded malicious patterns
      encodedMaliciousFilenames.forEach((filename) => {
        const decoded = decodeURIComponent(filename);
        expect(() => utils.sanitizeFilename(decoded)).to.throw(
          "Invalid filename provided"
        );
      });
    });
  });
});
