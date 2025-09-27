import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Proje oluşturma şeması
const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  technology: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  repository: z.string().url('Invalid repository URL').optional(),
});

// Proje güncelleme şeması
const updateProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD']).optional(),
  technology: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  repository: z.string().url('Invalid repository URL').optional(),
});

export const validateProject = {
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      createProjectSchema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: (error as z.ZodError).errors
        });
      }
      next(error);
    }
  },

  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      updateProjectSchema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: (error as z.ZodError).errors
        });
      }
      next(error);
    }
  }
};