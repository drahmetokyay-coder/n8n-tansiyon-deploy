import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Swipe from '../models/Swipe';
import Match from '../models/Match';
import JobPost from '../models/JobPost';
import User from '../models/User';
import { SwipeDirection, UserType, MatchStatus } from '../../../shared/types';
import { createNotification } from '../services/notificationService';

export const swipeJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = req.user;
    const { jobId, direction } = req.body;

    if (user.userType !== UserType.JOB_SEEKER) {
      res.status(403).json({ error: 'Only job seekers can swipe on jobs' });
      return;
    }

    // Validate direction
    if (!Object.values(SwipeDirection).includes(direction)) {
      res.status(400).json({ error: 'Invalid swipe direction' });
      return;
    }

    // Check if job exists
    const job = await JobPost.findById(jobId);
    if (!job || !job.isActive) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if already swiped
    const existingSwipe = await Swipe.findOne({ userId, targetId: jobId });
    if (existingSwipe) {
      res.status(400).json({ error: 'Already swiped on this job' });
      return;
    }

    // Create swipe
    const swipe = new Swipe({
      userId,
      targetId: jobId,
      targetType: 'JobPost',
      direction
    });
    await swipe.save();

    // Update job stats
    job.swipeCount += 1;
    await job.save();

    let isMatch = false;
    let match = null;

    // If right swipe, check for match
    if (direction === SwipeDirection.RIGHT) {
      // Check if employer swiped right on this job seeker
      const employerSwipe = await Swipe.findOne({
        userId: job.employerId,
        targetId: userId,
        targetType: 'User',
        direction: SwipeDirection.RIGHT
      });

      if (employerSwipe) {
        // Create match
        match = new Match({
          jobSeekerId: userId,
          employerId: job.employerId,
          jobPostId: jobId,
          status: MatchStatus.MATCHED
        });
        await match.save();

        // Update job match count
        job.matchCount += 1;
        await job.save();

        isMatch = true;

        // Send notification to employer
        await createNotification(
          job.employerId.toString(),
          'match',
          'Yeni Eşleşme!',
          `${user.profile.firstName} ile eşleştiniz!`,
          { matchId: match._id }
        );

        // Send notification to job seeker
        await createNotification(
          userId,
          'match',
          'Yeni Eşleşme!',
          `${job.title} pozisyonu için eşleştiniz!`,
          { matchId: match._id }
        );
      }
    }

    res.json({
      message: 'Swipe recorded successfully',
      isMatch,
      match
    });
  } catch (error: any) {
    console.error('Swipe job error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
};

export const swipeCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = req.user;
    const { candidateId, jobId, direction } = req.body;

    if (user.userType !== UserType.EMPLOYER) {
      res.status(403).json({ error: 'Only employers can swipe on candidates' });
      return;
    }

    // Validate direction
    if (!Object.values(SwipeDirection).includes(direction)) {
      res.status(400).json({ error: 'Invalid swipe direction' });
      return;
    }

    // Check if candidate exists
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.userType !== UserType.JOB_SEEKER) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    // Check if job exists and belongs to employer
    const job = await JobPost.findOne({ _id: jobId, employerId: userId });
    if (!job) {
      res.status(404).json({ error: 'Job not found or unauthorized' });
      return;
    }

    // Check if already swiped
    const existingSwipe = await Swipe.findOne({ userId, targetId: candidateId });
    if (existingSwipe) {
      res.status(400).json({ error: 'Already swiped on this candidate' });
      return;
    }

    // Create swipe
    const swipe = new Swipe({
      userId,
      targetId: candidateId,
      targetType: 'User',
      direction
    });
    await swipe.save();

    let isMatch = false;
    let match = null;

    // If right swipe, check for match
    if (direction === SwipeDirection.RIGHT) {
      // Check if candidate swiped right on this job
      const candidateSwipe = await Swipe.findOne({
        userId: candidateId,
        targetId: jobId,
        targetType: 'JobPost',
        direction: SwipeDirection.RIGHT
      });

      if (candidateSwipe) {
        // Create match
        match = new Match({
          jobSeekerId: candidateId,
          employerId: userId,
          jobPostId: jobId,
          status: MatchStatus.MATCHED
        });
        await match.save();

        // Update job match count
        job.matchCount += 1;
        await job.save();

        isMatch = true;

        // Send notification to candidate
        await createNotification(
          candidateId,
          'match',
          'Yeni Eşleşme!',
          `${job.title} pozisyonu için eşleştiniz!`,
          { matchId: match._id }
        );

        // Send notification to employer
        await createNotification(
          userId,
          'match',
          'Yeni Eşleşme!',
          `${candidate.profile.firstName} ile eşleştiniz!`,
          { matchId: match._id }
        );
      }
    }

    res.json({
      message: 'Swipe recorded successfully',
      isMatch,
      match
    });
  } catch (error: any) {
    console.error('Swipe candidate error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
};

export const getSwipeHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 50, direction } = req.query;

    const query: any = { userId };
    if (direction) {
      query.direction = direction;
    }

    const swipes = await Swipe.find(query)
      .populate('targetId')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Swipe.countDocuments(query);

    res.json({
      swipes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get swipe history error:', error);
    res.status(500).json({ error: 'Failed to get swipe history' });
  }
};
