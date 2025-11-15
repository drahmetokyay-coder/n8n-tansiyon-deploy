import express from 'express';
import { body } from 'express-validator';
import { swipeJob, swipeCandidate, getSwipeHistory } from '../controllers/swipeController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

router.post(
  '/job',
  authenticate,
  validate([
    body('jobId').isMongoId(),
    body('direction').isIn(['left', 'right', 'up'])
  ]),
  swipeJob
);

router.post(
  '/candidate',
  authenticate,
  validate([
    body('candidateId').isMongoId(),
    body('jobId').isMongoId(),
    body('direction').isIn(['left', 'right', 'up'])
  ]),
  swipeCandidate
);

router.get('/history', authenticate, getSwipeHistory);

export default router;
