const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');
const { fileUpload, uploadToCloud } = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  uploadToCloud,
  [
    check('name').notEmpty(),
    check('email', 'please provide a valid email address.')
      .normalizeEmail()
      .isEmail(),
    check('password', 'password should be alpha numeric 8 characters long ')
      .isAlphanumeric()
      .isLength({ min: 8 }),
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
