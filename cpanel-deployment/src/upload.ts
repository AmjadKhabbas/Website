import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Express } from 'express';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

export function setupUploadRoutes(app: Express) {
  // Single file upload endpoint
  app.post('/api/upload/image', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imageUrl = `/api/uploads/${req.file.filename}`;
      
      res.json({
        message: 'File uploaded successfully',
        imageUrl: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  // Multiple files upload endpoint
  app.post('/api/upload/images', upload.array('images', 10), (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const uploadedFiles = req.files.map(file => ({
        imageUrl: `/api/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));

      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  // Serve uploaded files
  app.get('/api/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Serve the file
    res.sendFile(filepath);
  });

  // Delete uploaded file
  app.delete('/api/uploads/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ message: 'File deleted successfully' });
      } else {
        res.status(404).json({ message: 'File not found' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Delete failed' });
    }
  });
}