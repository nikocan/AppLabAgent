import express from 'express';import express from 'express';

import cors from 'cors';import cors from 'cors';

import { PrismaClient } from '@prisma/client';import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';import authRoutes from './routes/authRoutes';

import projectRoutes from './routes/projectRoutes';import projectRoutes from './routes/projectRoutes';

import taskRoutes from './routes/taskRoutes';import taskRoutes from './routes/taskRoutes';

import userRoutes from './routes/userRoutes';import userRoutes from './routes/userRoutes';

import { errorHandler } from './middleware/errorHandler';import { errorHandler } from './middleware/errorHandler';

import { authenticate } from './middleware/authenticate';

dotenv.config();

dotenv.config();

const app = express();

export const prisma = new PrismaClient();const app = express();

export const prisma = new PrismaClient();

// Middleware

app.use(cors());// Middleware

app.use(express.json());app.use(cors());

app.use(express.urlencoded({ extended: true }));app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Health check

app.get('/health', (req, res) => {// Routes

  res.json({ status: 'ok', timestamp: new Date().toISOString() });app.use('/api/auth', authRoutes);

});app.use('/api/projects', authenticate, projectRoutes);

app.use('/api/tasks', authenticate, taskRoutes);

// Routesapp.use('/api/users', authenticate, userRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/projects', projectRoutes);// Error handling

app.use('/api/tasks', taskRoutes);app.use(errorHandler);

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3001;

// Error handling

app.use(errorHandler);async function startServer() {

  try {

const PORT = process.env.PORT || 3001;    await prisma.$connect();

    console.log('🎯 Connected to database');

async function startServer() {    

  try {    app.listen(PORT, () => {

    await prisma.$connect();      console.log(`🚀 Server running on port ${PORT}`);

    console.log('📦 Connected to database');    });

      } catch (error) {

    app.listen(PORT, () => {    console.error('❌ Error starting server:', error);

      console.log(`🚀 Server running on port ${PORT}`);    process.exit(1);

    });  }

  } catch (error) {}

    console.error('❌ Error starting server:', error);

    process.exit(1);startServer();
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();