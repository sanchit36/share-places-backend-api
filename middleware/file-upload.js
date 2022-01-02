const multer = require('multer');
const DatauriParser = require('datauri/parser');
const path = require('path');
const HttpError = require('../models/http-error');
const { uploader } = require('../config/cloudinaryConfig');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.memoryStorage();

const parser = new DatauriParser();

const fileUpload = multer({
  limits: 500000,
  storage,
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid file type');
    cb(error, isValid);
  },
});

const dataUri = (req) =>
  parser.format(
    path.extname(req.file.originalname).toString(),
    req.file.buffer
  );

const uploadToCloud = (req, res, next) => {
  if (req.file) {
    const file = dataUri(req).content;
    uploader
      .upload(file)
      .then((result) => {
        const image = result.url;
        req.image = image;
        return next();
      })
      .catch((err) => {
        console.log(err);
        return next(new HttpError('Could not upload image, try again.', 500));
      });
  } else {
    return next(new HttpError('Could not upload image, try again.', 500));
  }
};

module.exports = { fileUpload, uploadToCloud };
