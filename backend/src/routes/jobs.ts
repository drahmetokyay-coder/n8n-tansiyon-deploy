import express from 'express';
import { body } from 'express-validator';
import {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getCandidates
} from '../controllers/jobController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

router.post(
  '/',
  authenticate,
  validate([
    body('title').trim().notEmpty().isLength({ max: 100 }),
    body('description').trim().notEmpty().isLength({ max: 2000 }),
    body('jobType').isIn(['part_time', 'freelance', 'temporary', 'contract']),
    body('location').isObject(),
    body('location.coordinates').isArray({ min: 2, max: 2 }),
    body('requirements.skills').isArray({ min: 1 }),
    body('schedule.days').isArray(),
    body('schedule.hours').notEmpty(),
    body('compensation.amount').isNumeric(),
    body('compensation.period').isIn(['hour', 'day', 'week', 'month', 'project'])
  ]),
  createJob
);

router.get('/', authenticate, getJobs);
router.get('/my-jobs', authenticate, getMyJobs);
router.get('/:jobId', authenticate, getJobById);
router.get('/:jobId/candidates', authenticate, getCandidates);

router.put(
  '/:jobId',
  authenticate,
  validate([
    body('title').optional().trim().isLength({ max: 100 }),
    body('description').optional().trim().isLength({ max: 2000 })
  ]),
  updateJob
);

router.delete('/:jobId', authenticate, deleteJob);

export default router;
