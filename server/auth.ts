import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, verifyPassword, hashPassword, StoredUser } from './db';
import { AdminUser, AdminRole } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'jambo-festival-2026-secure-auth-key-kinshasa';

export interface AuthenticatedRequest extends Request {
  user?: AdminUser;
}

export function generateToken(user: AdminUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyToken(tokenString: string): AdminUser | null {
  try {
    const [payloadB64, signature] = tokenString.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Expired
    }

    // Verify user still exists and is active in DB
    const stored = db.get().users.find(u => u.id === payload.id && u.active);
    if (!stored) return null;

    const { passwordHash, passwordSalt, ...safeUser } = stored;
    return safeUser;
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé. Veuillez vous connecter.' });
  }

  const token = authHeader.substring(7).trim();
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
  }

  req.user = user;
  next();
}

export function requireRole(role: AdminRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié.' });
    }
    if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Permissions insuffisantes. Réservé aux Super Administrateurs.' });
    }
    next();
  };
}
