import { Request, Response } from 'express'

export interface CustomRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export interface RouteHandler {
  (req: CustomRequest, res: Response): Promise<void> | void;
}

export interface RouteConfig {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  handler: RouteHandler;
  auth?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  courseId: string;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
} 