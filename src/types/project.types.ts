import { Project, ProjectStatus, Task, User } from '@prisma/client';

export interface ProjectWithRelations extends Project {
  tasks?: Task[];
  creator?: User;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  technology?: string[];
  startDate?: string;
  endDate?: string;
  repository?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  technology?: string[];
  startDate?: string;
  endDate?: string;
  repository?: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
}