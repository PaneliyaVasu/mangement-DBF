import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../services/dataStore.ts';
import { registerSchema, loginSchema } from '../validators/index.ts';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.ts';
import { User } from '../../../shared/types/index.ts';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = dbStore.users.find(
      (u) => u.email.toLowerCase() === validated.email.toLowerCase()
    );
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists',
        errorCode: 'EMAIL_ALREADY_EXISTS',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: validated.name,
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      role: validated.role,
      centerIds: ['center-surat-01'],
      active: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.users.push(newUser);
    dbStore.setPasswordHash(newUser.id, passwordHash);

    const token = generateToken({
      userId: newUser.id,
      role: newUser.role,
      centerIds: newUser.centerIds,
      email: newUser.email,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: newUser,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.errors ? error.errors[0]?.message : error.message,
      errorCode: 'VALIDATION_ERROR',
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body);

    const user = dbStore.users.find(
      (u) => u.email.toLowerCase() === validated.email.toLowerCase()
    );
    if (!user || !user.active) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const hash = dbStore.getPasswordHash(user.id);
    if (!hash) {
      res.status(401).json({
        success: false,
        message: 'Authentication error',
        errorCode: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
      return;
    }

    user.lastLoginAt = new Date().toISOString();

    const token = generateToken({
      userId: user.id,
      role: user.role,
      centerIds: user.centerIds,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.errors ? error.errors[0]?.message : error.message,
      errorCode: 'VALIDATION_ERROR',
    });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
    return;
  }

  const user = dbStore.users.find((u) => u.id === req.user?.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' });
    return;
  }

  res.json({
    success: true,
    data: user,
  });
}

export async function refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
    return;
  }

  const user = dbStore.users.find((u) => u.id === req.user?.userId);
  if (!user || !user.active) {
    res.status(401).json({ success: false, message: 'User inactive or removed', errorCode: 'UNAUTHORIZED' });
    return;
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
    centerIds: user.centerIds,
    email: user.email,
    name: user.name,
  });

  res.json({
    success: true,
    data: {
      token,
      user,
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
