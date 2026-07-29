import multer from 'multer';
import path from 'path';
import { TEMPLATES_DIR } from '../utils/paths';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMPLATES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.docx';
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim();
    const uniqueName = `${baseName || 'template'}_${uuidv4().substring(0, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/x-zip-compressed',
    'application/zip',
    'application/octet-stream'
  ];

  if (ext === '.docx' || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Microsoft Word (.docx) files are allowed!'));
  }
};

export const uploadTemplateMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size
  },
});
