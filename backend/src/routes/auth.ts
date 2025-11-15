import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('userType').isIn(['job_seeker', 'employer']),
    body('profile').isObject(),
    body('location').isObject(),
    body('location.coordinates').isArray({ min: 2, max: 2 })
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ]),
  login
);

router.get('/profile', authenticate, getProfile);

router.put(
  '/profile',
  authenticate,
  validate([
    body('profile').optional().isObject(),
    body('location').optional().isObject()
  ]),
  updateProfile
);

export default router;
