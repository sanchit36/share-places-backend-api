const { validationResult } = require('express-validator');

const User = require('../models/user');
const HttpError = require('../models/http-error');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
  } catch (err) {
    const error = new HttpError('Getting users failed, please try again', 500);
    return next(error);
  }
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please try again', 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: 'dummy_image',
    password,
    places: [],
  });

  try {
    createdUser.save();
  } catch (err) {
    const error = new HttpError('Sign up Failed', 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }

  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again', 500);
    return next(error);
  }

  if (!identifiedUser || identifiedUser.password !== password) {
    const error = new HttpError(
      'Could not identify user, credentials seems to be wrong',
      401
    );
    return next(error);
  }

  res.status(200).json({ message: 'Logged in!' });
};
