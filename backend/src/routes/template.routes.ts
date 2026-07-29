import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { uploadTemplateMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.post('/upload', uploadTemplateMiddleware.single('file'), TemplateController.uploadTemplate);
router.post('/extract', TemplateController.extractPlaceholders);
router.get('/', TemplateController.listTemplates);
router.delete('/:id', TemplateController.deleteTemplate);

export default router;
