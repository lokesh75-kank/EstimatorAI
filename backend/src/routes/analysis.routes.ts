import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';

const router = Router();
const analysisController = new AnalysisController();

router.get('/', analysisController.getAll);
router.get('/:id', analysisController.getById);
router.post('/', analysisController.create);
router.put('/:id', analysisController.update);
router.delete('/:id', analysisController.delete);

export default router; 