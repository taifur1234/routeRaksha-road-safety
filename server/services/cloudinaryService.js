import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) {
    return true;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    isConfigured = true;
    return true;
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  isConfigured = true;
  return true;
}

function uploadImageBuffer(file, folder) {
  if (!file?.buffer) {
    return Promise.resolve(null);
  }

  if (!configureCloudinary()) {
    const error = new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
    error.code = "CLOUDINARY_NOT_CONFIGURED";
    error.statusCode = 500;
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        secure: true,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) {
          const uploadError = new Error(
            error.http_code === 403
              ? "Cloudinary rejected the upload. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env."
              : error.message || "Cloudinary upload failed.",
          );
          uploadError.statusCode = error.http_code === 403 ? 502 : 500;
          uploadError.cause = error;
          reject(uploadError);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(file.buffer);
  });
}

async function deleteCloudinaryImage(publicId) {
  if (!publicId || !configureCloudinary()) {
    return;
  }

  await cloudinary.uploader.destroy(publicId).catch(() => {});
}

export { deleteCloudinaryImage, uploadImageBuffer };
