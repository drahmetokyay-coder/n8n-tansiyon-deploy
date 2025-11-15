import express from 'express';
import { body } from 'express-validator';
import {
  getMatches,
  getMatchById,
  unmatch,
  getMatchMessages,
  sendMessage
} from '../controllers/matchController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

router.get('/', authenticate, getMatches);
router.get('/:matchId', authenticate, getMatchById);
router.delete('/:matchId', authenticate, unmatch);

router.get('/:matchId/messages', authenticate, getMatchMessages);

router.post(
  '/:matchId/messages',
  authenticate,
  validate([
    body('content').trim().notEmpty().isLength({ max: 5000 })
  ]),
  sendMessage
);

export default router;
