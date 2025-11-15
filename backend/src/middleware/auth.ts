import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

export const requireUserType = (userType: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.userType !== userType) {
      res.status(403).json({ error: 'Access denied. Invalid user type.' });
      return;
    }
    next();
  };
};
