import multer from "multer";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function imageFileFilter(req, file, callback) {
  if (!allowedImageTypes.has(file.mimetype)) {
    callback(new Error("Only JPG, PNG, and WebP images are allowed."));
    return;
  }

  callback(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: imageFileFilter,
});

const uploadProfilePhoto = upload.single("photo");
const uploadReportImage = upload.single("image");

export { uploadProfilePhoto, uploadReportImage };
