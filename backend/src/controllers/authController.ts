import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { UserType } from '../../../shared/types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, userType, profile, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Validate user type
    if (!Object.values(UserType).includes(userType)) {
      res.status(400).json({ error: 'Invalid user type' });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      userType,
      profile,
      location
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(401).json({ error: 'Account is deactivated' });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { profile, location } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    if (location) {
      user.location = location;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
