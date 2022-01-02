const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/places-controller');
const checkAuth = require('../middleware/check-auth');
const { fileUpload, uploadToCloud } = require('../middleware/file-upload');

const router = express.Router();

router.get('/:pid', placesController.getPlaceById);

router.get('/user/:uid', placesController.getPlacesByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  uploadToCloud,
  [
    check('title').notEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').notEmpty(),
  ],
  placesController.createPlace
);

router.patch(
  '/:pid',
  [check('title').notEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlace
);

router.delete('/:pid', placesController.deletePlace);

module.exports = router;
