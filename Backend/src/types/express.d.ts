import { UserRole } from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: UserRole;
      };
    }
  }
}

export {};
