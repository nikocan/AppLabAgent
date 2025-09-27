import { Request, Response } from 'express';
import { prisma } from '../server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client/scripts/default-index.js';

interface AuthRequest extends Request {
  user?: any;
}

export const projectController = {
  // Tüm projeleri getir
  async getAllProjects(req: AuthRequest, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          creatorId: req.user.id
        },
        include: {
          tasks: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects' });
    }
  },

  // Tekil proje getir
  async getProjectById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project' });
    }
  },

  // Yeni proje oluştur
  async createProject(req: AuthRequest, res: Response) {
    try {
      const { name, description, technology, startDate, endDate, repository } = req.body;

      const project = await prisma.project.create({
        data: {
          name,
          description,
          technology,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          repository,
          creatorId: req.user.id
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.status(201).json(project);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return res.status(400).json({ message: 'Invalid project data' });
      }
      res.status(500).json({ message: 'Error creating project' });
    }
  },

  // Proje güncelle
  async updateProject(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, status, technology, startDate, endDate, repository } = req.body;

      const project = await prisma.project.findUnique({
        where: { id }
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          name,
          description,
          status,
          technology,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          repository
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      res.json(updatedProject);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ message: 'Invalid project data' });
      }
      res.status(500).json({ message: 'Error updating project' });
    }
  },

  // Proje sil
  async deleteProject(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const project = await prisma.project.findUnique({
        where: { id }
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await prisma.project.delete({
        where: { id }
      });

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project' });
    }
  },

  // Proje istatistikleri
  async getProjectStats(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          tasks: true
        }
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const stats = {
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter((task: { status: string }) => task.status === 'DONE').length,
        inProgressTasks: project.tasks.filter((task: { status: string }) => task.status === 'IN_PROGRESS').length,
        todoTasks: project.tasks.filter((task: { status: string }) => task.status === 'TODO').length,
        reviewTasks: project.tasks.filter((task: { status: string }) => task.status === 'REVIEW').length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project statistics' });
    }
  }
};