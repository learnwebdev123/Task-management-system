const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/avatars',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 2 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Validation middleware
const profileValidation = [
  check('username').optional().trim().isLength({ min: 3 }),
  check('email').optional().isEmail(),
  check('department').optional().trim(),
  check('position').optional().trim()
];

// Routes
router.put('/profile',
  auth,
  profileValidation,
  userController.updateProfile
);

router.post('/avatar',
  auth,
  upload.single('avatar'),
  userController.updateAvatar
);

router.get('/all',
  auth,
  authorize('admin'),
  userController.getAllUsers
);

router.get('/:id',
  auth,
  userController.getUserById
);

router.post('/deactivate',
  auth,
  userController.deactivateAccount
);

module.exports = router; 