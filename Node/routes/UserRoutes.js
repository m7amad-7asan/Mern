const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/UserControllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post
(
    '/signup', 
    fileUpload.single('image'),
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ],
    userController.signup
);

router.post('/login', userController.login);

router.use(checkAuth);

router.get('/getProfile/:profileId', userController.getProfile);

router.patch
(
    '/updateProfile',
    fileUpload.single('image'),
    [
        check('name').not().isEmpty()
    ],
    userController.updateProfile
);

module.exports = router;