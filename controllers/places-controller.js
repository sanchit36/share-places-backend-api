const { validationResult } = require('express-validator');
const { v4: uuid } = require('uuid');

const HttpError = require('../models/http-error');
const getCoordinatesFromAddress = require('../util/location');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Taj Mahal',
    description:
      '17th-century, Mughal-style, marble mausoleum with minarets, a mosque & famously symmetrical gardens.',
    location: {
      lat: 27.1751448,
      lng: 78.0399535,
    },
    address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001',
    creator: 'u1',
  },
];

exports.getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    return next(new HttpError('Could not find place for the provided id', 404));
  }

  res.json({ place });
};

exports.getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id', 404)
    );
  }

  res.json({ places });
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

exports.updatePlace = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

exports.deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find the place this id', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: 'Deleted place.' });
};
