const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordinatesFromAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const { getPublicIdForUrl } = require('../middleware/file-upload');
const { uploader } = require('../config/cloudinaryConfig');

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  try {
    const place = await Place.findById(placeId, { __v: 0 });
    if (!place) {
      return next(
        new HttpError('Could not find place for the provided id', 404)
      );
    }

    res.json({ place: place.toObject({ getters: true }) });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(new HttpError('Invalid place id', 422));
    }

    return next(
      new HttpError('something went wrong, could not find a place', 500)
    );
  }
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const userWithPlaces = await User.findById(userId).populate('places');
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
      return next(
        new HttpError('Could not find places for the provided user id', 404)
      );
    }

    res.json({
      places: userWithPlaces.places.map((place) =>
        place.toObject({ getters: true })
      ),
    });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(new HttpError('Invalid user id', 422));
    }
    return next(err);
  }
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty() || !req.image) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.image,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
    res.status(201).json({ place: createdPlace });
  } catch (error) {
    return next(new HttpError('Creating place failed, please try again', 500));
  }
};

exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not update place', 500)
    );
  }

  if (!place) {
    return next(new HttpError('Could not find place for the provided id', 404));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place', 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not update place', 500)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    return next(new HttpError('Deleting place failed, please try again', 500));
  }

  if (!place) {
    return next(new HttpError('Could not find place for the provided id', 404));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place', 401));
  }

  const imageURL = place.image;

  const id = getPublicIdForUrl(imageURL);

  try {
    uploader.destroy(id);
  } catch (error) {
    console.log(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not delete place.', 500)
    );
  }

  res.status(200).json({ message: 'Deleted place.' });
};
