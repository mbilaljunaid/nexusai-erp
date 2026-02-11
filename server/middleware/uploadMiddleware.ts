import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for dispute attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'disputes');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp + random + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `dispute-${uniqueSuffix}${ext}`);
    }
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, PDF, DOC, and DOCX files are allowed.'));
    }
};

// Create multer instance with configuration
export const disputeUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 5, // Maximum 5 files
    }
});

// Middleware wrapper for error handling
export const uploadDisputeFiles = (req: any, res: any, next: any) => {
    const upload = disputeUpload.array('attachments', 5);

    upload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size exceeds 5MB limit' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ message: 'Maximum 5 files allowed' });
            }
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
