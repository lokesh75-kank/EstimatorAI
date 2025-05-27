import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });
const projectController = new ProjectController();

// Project creation schema
const projectSchema = z.object({
  clientName: z.string(),
  clientEmail: z.string().email(),
  building: z.object({
    type: z.string(),
    size: z.number().positive(),
  floors: z.number().int().positive(),
  zones: z.number().int().positive(),
  }),
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const projectData = projectSchema.parse(req.body);
    const project = await projectController.create(req, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Upload project files
router.post('/:projectId/files', upload.array('files'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const files = req.files as Express.Multer.File[];
    // TODO: Implement file upload handling
    res.json({ message: 'File upload not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading files' });
  }
});

// Get project details
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    await projectController.getById(req, res);
  } catch (error) {
    res.status(404).json({ error: 'Project not found' });
  }
});

// List all projects
router.get('/', async (req, res) => {
  try {
    await projectController.getAll(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

export default router; 