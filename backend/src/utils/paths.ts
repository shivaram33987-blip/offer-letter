import path from 'path';
import fs from 'fs';

const rootDir = path.resolve(__dirname, '../../');

export const UPLOADS_DIR = path.join(rootDir, 'uploads');
export const TEMPLATES_DIR = path.join(rootDir, 'templates');
export const GENERATED_DIR = path.join(rootDir, 'generated');

// Ensure required directories exist
[UPLOADS_DIR, TEMPLATES_DIR, GENERATED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
