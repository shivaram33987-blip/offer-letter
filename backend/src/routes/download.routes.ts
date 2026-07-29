import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GENERATED_DIR, TEMPLATES_DIR } from '../utils/paths';

const router = Router();

/**
 * GET /api/download/:filename
 * Serves generated Word or PDF documents for download
 */
router.get('/:filename', (req: Request, res: Response) => {
  try {
    const rawFilename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
    const filename = path.basename(rawFilename || '');
    let filePath = path.join(GENERATED_DIR, filename);

    if (!fs.existsSync(filePath)) {
      // Check templates dir if not in generated dir
      filePath = path.join(TEMPLATES_DIR, filename);
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: `File '${filename}' not found.` });
      return;
    }

    res.download(filePath, filename, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Failed to download file' });
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'File download error' });
  }
});

export default router;
