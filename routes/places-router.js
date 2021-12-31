const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/places-controller');

const router = express.Router();

router.post(
  '/',
  [
    check('title').notEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').notEmpty(),
  ],
  placesController.createPlace
);

router.get('/:pid', placesController.getPlaceById);

router.patch(
  '/:pid',
  [check('title').notEmpty(), check('description').isLength({ min: 5 })],
  placesController.updatePlace
);

router.delete('/:pid', placesController.deletePlace);

router.get('/user/:uid', placesController.getPlacesByUserId);

module.exports = router;
