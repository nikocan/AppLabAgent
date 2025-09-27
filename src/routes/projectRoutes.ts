import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate } from '../middleware/authenticate';
import { validateProject } from '../middleware/validateProject';

const router = Router();

// Tüm rotalar authentication gerektirir
router.use(authenticate);

// Proje rotaları
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', validateProject.create, projectController.createProject);
router.put('/:id', validateProject.update, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id/stats', projectController.getProjectStats);

export default router;