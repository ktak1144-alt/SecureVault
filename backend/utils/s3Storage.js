const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getS3Client } = require("../config/s3");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const getBucketName = () => process.env.AWS_BUCKET_NAME;
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is not defined in .env!");
  return key.padEnd(32, "0").slice(0, 32);
};

//  Encrypt and Upload to S3
const encryptAndUploadToS3 = async (filePath, originalName, mimetype) => {
  try {
    // Read file
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString("base64");

    // Encrypt with AES-256
    const encrypted = CryptoJS.AES.encrypt(
      base64Data,
      CryptoJS.enc.Utf8.parse(getEncryptionKey()),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      },
    ).toString();

    // Generate unique S3 key
    const s3Key = `encrypted/${uuidv4()}-${Date.now()}.enc`;

    // Upload encrypted file to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: getBucketName(),
      Key: s3Key,
      Body: Buffer.from(encrypted),
      ContentType: "application/octet-stream",
      Metadata: {
        originalName,
        mimetype,
      },
    });

   // Retry upload up to 3 times
    let uploaded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await getS3Client().send(uploadCommand);
        uploaded = true;
        break;
      } catch (err) {
        console.warn(`⚠️ S3 Upload attempt ${attempt} failed: ${err.message}`);
        if (attempt === 3) throw err;
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Delete local temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.log(" File encrypted and uploaded to S3!");
    return s3Key;
  } catch (error) {
    console.error(" S3 Upload error:", error.message);
    throw error;
  }
};

//  Download and Decrypt from S3
const downloadAndDecryptFromS3 = async (s3Key) => {
  try {
    // Download from S3
    const downloadCommand = new GetObjectCommand({
      Bucket: getBucketName(),
      Key: s3Key,
    });

    const response = await getS3Client().send(downloadCommand);

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const encryptedData = Buffer.concat(chunks).toString();

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      CryptoJS.enc.Utf8.parse(getEncryptionKey()),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const base64Data = decrypted.toString(CryptoJS.enc.Utf8);

    if (!base64Data) {
      throw new Error("Decryption failed!");
    }

    console.log(" File downloaded and decrypted from S3!");
    return Buffer.from(base64Data, "base64");
  } catch (error) {
    console.error(" S3 Download error:", error.message);
    throw error;
  }
};

//  Delete from S3
const deleteFromS3 = async (s3Key) => {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: s3Key,
    });

    await getS3Client().send(deleteCommand);
    console.log(" File deleted from S3!");
  } catch (error) {
    console.error(" S3 Delete error:", error.message);
    throw error;
  }
};

module.exports = {
  encryptAndUploadToS3,
  downloadAndDecryptFromS3,
  deleteFromS3,
};
