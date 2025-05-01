declare namespace Express {
  interface Request {
    auth?: {
      id: number;
      role: "admin" | "user";
    };
  }
} 