const { v4: uuid } = require('uuid');
const HttpError = require('../models/http-error');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Sanchit Bhadgal',
    email: 'sanchit@gmail.com',
    password: 'abc',
  },
];

exports.getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

exports.signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);

  if (hasUser) {
    throw new HttpError('Could not create user, email already exists', 422);
  }

  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      'Could not identify user, credentials seems to be wrong',
      401
    );
  }

  res.status(200).json({ message: 'Logged in!' });
};
