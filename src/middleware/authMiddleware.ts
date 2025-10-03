// src/middleware/authMiddleware.ts
// Middleware to verify JWT and attach user info to request
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    username: string;
  };
}

// JWT verification middleware
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Verify and decode token using env secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // Attach user info to request
    req.user = decoded as { id: number; role: string; username: string };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}
