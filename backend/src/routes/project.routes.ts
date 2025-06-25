import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { ProjectController } from '../controllers/project.controller';

const router = Router();
const upload = multer({ dest: 'uploads/' });
const projectController = new ProjectController();

// Project creation schema
const projectSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  building: z.object({
    type: z.string().min(1, "Building type is required"),
    size: z.number().positive("Square footage must be positive"),
    floors: z.number().int().positive("Number of floors must be positive"),
    zones: z.number().int().positive("Number of zones must be positive"),
  }),
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const projectData = projectSchema.parse(req.body);
    const project = await projectController.create(req, res);
    // The controller should handle the response, so we don't need to return anything here
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Project creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Upload project files
router.post('/:id/files', upload.array('files'), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    // TODO: Implement file upload handling
    res.json({ message: 'File upload not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading files' });
  }
});

// Get project details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

// Delete individual project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await projectController.delete(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project' });
  }
});

// Clear all projects (for development/testing)
router.delete('/', async (req, res) => {
  try {
    await projectController.clearAll(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Error clearing projects' });
  }
});

export default router; 