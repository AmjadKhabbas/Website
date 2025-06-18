declare module 'express-session' {
  interface SessionData {
    adminId?: number;
  }
  
  interface Session {
    adminId?: number;
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