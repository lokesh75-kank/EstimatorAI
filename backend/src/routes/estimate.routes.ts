import { Router } from 'express';
import { EstimateController } from '../controllers/estimate.controller';

const router = Router();
const estimateController = new EstimateController();

router.get('/', estimateController.getAll);
router.get('/:id', estimateController.getById);
router.post('/', estimateController.create);
router.put('/:id', estimateController.update);
router.delete('/:id', estimateController.delete);

export default router; 