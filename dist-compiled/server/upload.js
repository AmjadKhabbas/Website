"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.setupUploadRoutes = setupUploadRoutes;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter
});
function setupUploadRoutes(app) {
    // Single file upload endpoint
    app.post('/api/upload/image', exports.upload.single('image'), (req, res) => {
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
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ message: 'Upload failed' });
        }
    });
    // Multiple files upload endpoint
    app.post('/api/upload/images', exports.upload.array('images', 10), (req, res) => {
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
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ message: 'Upload failed' });
        }
    });
    // Serve uploaded files
    app.get('/api/uploads/:filename', (req, res) => {
        const filename = req.params.filename;
        const filepath = path_1.default.join(uploadsDir, filename);
        // Check if file exists
        if (!fs_1.default.existsSync(filepath)) {
            return res.status(404).json({ message: 'File not found' });
        }
        // Serve the file
        res.sendFile(filepath);
    });
    // Delete uploaded file
    app.delete('/api/uploads/:filename', (req, res) => {
        try {
            const filename = req.params.filename;
            const filepath = path_1.default.join(uploadsDir, filename);
            if (fs_1.default.existsSync(filepath)) {
                fs_1.default.unlinkSync(filepath);
                res.json({ message: 'File deleted successfully' });
            }
            else {
                res.status(404).json({ message: 'File not found' });
            }
        }
        catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ message: 'Delete failed' });
        }
    });
}
//# sourceMappingURL=upload.js.map