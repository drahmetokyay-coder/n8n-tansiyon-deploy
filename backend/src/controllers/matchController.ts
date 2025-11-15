import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Match from '../models/Match';
import Message from '../models/Message';
import { MatchStatus } from '../../../shared/types';

export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { page = 1, limit = 20, status = MatchStatus.MATCHED } = req.query;

    const query: any = {
      $or: [{ jobSeekerId: userId }, { employerId: userId }],
      status
    };

    const matches = await Match.find(query)
      .populate('jobSeekerId', 'profile email')
      .populate('employerId', 'profile email')
      .populate('jobPostId', 'title description compensation')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ lastMessageAt: -1, createdAt: -1 });

    const total = await Match.countDocuments(query);

    res.json({
      matches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

export const getMatchById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ jobSeekerId: userId }, { employerId: userId }]
    })
      .populate('jobSeekerId', 'profile email location')
      .populate('employerId', 'profile email location')
      .populate('jobPostId');

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    res.json({ match });
  } catch (error: any) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
};

export const unmatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ jobSeekerId: userId }, { employerId: userId }]
    });

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    match.status = MatchStatus.UNMATCHED;
    await match.save();

    res.json({ message: 'Unmatched successfully' });
  } catch (error: any) {
    console.error('Unmatch error:', error);
    res.status(500).json({ error: 'Failed to unmatch' });
  }
};

export const getMatchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this match
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ jobSeekerId: userId }, { employerId: userId }]
    });

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    const messages = await Message.find({ matchId })
      .populate('senderId', 'profile.firstName profile.lastName profile.companyName')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: 1 });

    const total = await Message.countDocuments({ matchId });

    // Mark messages as read
    await Message.updateMany(
      { matchId, senderId: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    res.json({
      messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;
    const { content } = req.body;

    // Verify user is part of this match
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ jobSeekerId: userId }, { employerId: userId }],
      status: MatchStatus.MATCHED
    });

    if (!match) {
      res.status(404).json({ error: 'Match not found or inactive' });
      return;
    }

    const message = new Message({
      matchId,
      senderId: userId,
      content
    });

    await message.save();

    // Update match's last message time
    match.lastMessageAt = new Date();
    await match.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'profile.firstName profile.lastName profile.companyName');

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
