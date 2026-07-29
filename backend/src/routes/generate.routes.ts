import { Router } from 'express';
import { GenerateController } from '../controllers/generate.controller';

const router = Router();

router.post('/docx', GenerateController.generateDocx);
router.post('/pdf', GenerateController.generatePdf);

export default router;
