declare module 'express-session' {
  interface SessionData {
    adminId?: number;
    userId?: number;
  }
  
  interface Session {
    adminId?: number;
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean;
      admin?: import('@shared/schema').AdminUser;
    }
  }
}

export {};