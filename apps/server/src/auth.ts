import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}

export function authMiddleware(app: Express) {
  app.use((req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
      }
    }

    next();
  });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}
