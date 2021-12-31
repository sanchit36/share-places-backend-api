const express = require('express');

const placesController = require('../controllers/places-controller');

const router = express.Router();

router.post('/', placesController.createPlace);

router.get('/:pid', placesController.getPlaceById);

router.patch('/:pid', placesController.updatePlace);

router.delete('/:pid', placesController.deletePlace);

router.get('/user/:uid', placesController.getPlacesByUserId);

module.exports = router;
