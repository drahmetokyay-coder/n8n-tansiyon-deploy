import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import JobPost from '../models/JobPost';
import User from '../models/User';
import Swipe from '../models/Swipe';
import { UserType, SwipeDirection } from '../../../shared/types';

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = req.user;

    if (user.userType !== UserType.EMPLOYER) {
      res.status(403).json({ error: 'Only employers can create job posts' });
      return;
    }

    const jobData = {
      ...req.body,
      employerId: userId
    };

    const job = new JobPost(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job post created successfully',
      job
    });
  } catch (error: any) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job post' });
  }
};

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = req.user;

    if (user.userType !== UserType.JOB_SEEKER) {
      res.status(403).json({ error: 'Only job seekers can browse jobs' });
      return;
    }

    const { page = 1, limit = 20, maxDistance = 50, skills, jobType } = req.query;

    // Get jobs that user hasn't swiped on yet
    const swipedJobIds = await Swipe.find({ userId }).distinct('targetId');

    const query: any = {
      _id: { $nin: swipedJobIds },
      isActive: true
    };

    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }

    // Filter by skills
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      query['requirements.skills'] = { $in: skillArray };
    }

    // Geospatial filter
    if (user.location && user.location.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: Number(maxDistance) * 1000 // Convert km to meters
        }
      };
    }

    const jobs = await JobPost.find(query)
      .populate('employerId', 'profile.companyName profile.logo profile.verified')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await JobPost.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = req.user;

    if (user.userType !== UserType.EMPLOYER) {
      res.status(403).json({ error: 'Only employers can view their jobs' });
      return;
    }

    const { page = 1, limit = 20, isActive } = req.query;

    const query: any = { employerId: userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const jobs = await JobPost.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await JobPost.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = await JobPost.findById(jobId)
      .populate('employerId', 'profile.companyName profile.logo profile.verified profile.description');

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Increment view count
    job.viewCount += 1;
    await job.save();

    res.json({ job });
  } catch (error: any) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    const job = await JobPost.findOne({ _id: jobId, employerId: userId });

    if (!job) {
      res.status(404).json({ error: 'Job not found or unauthorized' });
      return;
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error: any) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    const job = await JobPost.findOneAndDelete({ _id: jobId, employerId: userId });

    if (!job) {
      res.status(404).json({ error: 'Job not found or unauthorized' });
      return;
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

export const getCandidates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = req.user;
    const { jobId } = req.params;

    if (user.userType !== UserType.EMPLOYER) {
      res.status(403).json({ error: 'Only employers can view candidates' });
      return;
    }

    // Verify job belongs to employer
    const job = await JobPost.findOne({ _id: jobId, employerId: userId });
    if (!job) {
      res.status(404).json({ error: 'Job not found or unauthorized' });
      return;
    }

    const { page = 1, limit = 20 } = req.query;

    // Get candidates who haven't been swiped on by this employer for this job
    const swipedCandidateIds = await Swipe.find({
      userId,
      targetType: 'User'
    }).distinct('targetId');

    const query: any = {
      _id: { $nin: swipedCandidateIds },
      userType: UserType.JOB_SEEKER,
      isActive: true,
      'profile.skills': { $in: job.requirements.skills }
    };

    // Geospatial filter
    if (job.location && job.location.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: job.location.coordinates
          },
          $maxDistance: 50000 // 50km
        }
      };
    }

    const candidates = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      candidates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to get candidates' });
  }
};
