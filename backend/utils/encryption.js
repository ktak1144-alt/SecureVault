const CryptoJS = require("crypto-js");
const fs = require("fs");
const path = require("path");

//  Encrypt a file
const encryptFile = (filePath) => {
  try {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

    if (!ENCRYPTION_KEY) {
      throw new Error("ENCRYPTION_KEY is not defined in .env file!");
    }

    // Read the file
    const fileData = fs.readFileSync(filePath);

    // Convert to Base64 string
    const base64Data = fileData.toString("base64");

    // Encrypt using AES-256
    const encrypted = CryptoJS.AES.encrypt(
      base64Data,
      CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    ).toString();

    // Save encrypted file with .enc extension
    const encryptedPath = filePath + ".enc";
    fs.writeFileSync(encryptedPath, encrypted);

    // Delete original unencrypted file
    fs.unlinkSync(filePath);

    console.log(" File encrypted successfully!");
    return encryptedPath;

  } catch (error) {
    console.error(" Encryption error:", error.message);
    throw error;
  }
};

//  Decrypt a file
const decryptFile = (encryptedPath) => {
  try {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

    if (!ENCRYPTION_KEY) {
      throw new Error("ENCRYPTION_KEY is not defined in .env file!");
    }

    // Read encrypted file
    const encryptedData = fs.readFileSync(encryptedPath, "utf8");

    // Decrypt using AES-256
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    // Convert back to buffer
    const base64Data = decrypted.toString(CryptoJS.enc.Utf8);

    if (!base64Data) {
      throw new Error("Decryption failed — wrong key or corrupted file!");
    }

    const fileBuffer = Buffer.from(base64Data, "base64");

    console.log(" File decrypted successfully!");
    return fileBuffer;

  } catch (error) {
    console.error(" Decryption error:", error.message);
    throw error;
  }
};

module.exports = { encryptFile, decryptFile };