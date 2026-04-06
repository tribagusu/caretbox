import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
export const FILE_EXTENSIONS = [".pdf", ".txt", ".md", ".json", ".yaml", ".yml", ".xml", ".csv", ".toml", ".ini"];

const IMAGE_MIME_TYPES = [
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
];
const FILE_MIME_TYPES = [
  "application/pdf", "text/plain", "text/markdown", "application/json",
  "application/x-yaml", "text/yaml", "application/xml", "text/xml",
  "text/csv", "application/toml",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10 MB

export function validateFile(
  fileName: string,
  fileSize: number,
  mimeType: string,
  isImage: boolean
): { valid: boolean; error?: string } {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const allowedExts = isImage ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const allowedMimes = isImage ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (!allowedExts.includes(ext)) {
    return { valid: false, error: `File type ${ext} is not allowed` };
  }

  if (!allowedMimes.includes(mimeType)) {
    return { valid: false, error: `MIME type ${mimeType} is not allowed` };
  }

  if (fileSize > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return { valid: false, error: `File exceeds ${maxMB} MB limit` };
  }

  return { valid: true };
}

export function buildFileKey(userId: string, fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${userId}/${Date.now()}-${sanitized}`;
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function getFromR2(key: string) {
  return s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}
