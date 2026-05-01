const { S3Client } = require("@aws-sdk/client-s3");

let s3Client = null;

const getS3Client = () => {
  if (!s3Client) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;

    if (!accessKeyId || !secretAccessKey || !region) {
      throw new Error("AWS credentials missing in .env file!");
    }

    console.log("🔑 Initializing S3 with:");
    console.log("   Region:", region);
    console.log("   Access Key:", accessKeyId.substring(0, 8) + "...");
    console.log("   Secret Key Length:", secretAccessKey.length);

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim()
      }
    });
  }
  return s3Client;
};

module.exports = { getS3Client };