import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { analyzeImage, parseAnalysisResponse } from './services/imageAnalysisService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|dicom|dcm|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/dicom';

        if (extname && (mimetype || file.originalname.endsWith('.dcm'))) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, DICOM, PDF) are allowed!'));
        }
    }
});

// CORS configuration
app.use(cors());


app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Medical Analysis Service is running',
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        timestamp: new Date().toISOString()
    });
});

// Generic analysis endpoint
async function handleAnalysis(req, res, analysisType) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log(`[${new Date().toISOString()}] Analyzing ${analysisType}: ${req.file.filename}`);

        // Analyze the image
        const result = await analyzeImage(req.file.path, analysisType);

        // Parse the response for structured data
        const parsedResult = parseAnalysisResponse(result.analysis, analysisType);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            analysisType: analysisType,
            analysis: result.analysis,
            structured: parsedResult,
            model: result.model,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error(`[ERROR] ${analysisType} analysis failed:`, error.message);

        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message,
            details: 'Image analysis failed. Please try again.'
        });
    }
}

// X-Ray analysis endpoint
app.post('/api/analyze/xray', upload.single('image'), (req, res) => {
    handleAnalysis(req, res, 'xray');
});

// MRI analysis endpoint
app.post('/api/analyze/mri', upload.single('image'), (req, res) => {
    handleAnalysis(req, res, 'mri');
});

// CT scan analysis endpoint
app.post('/api/analyze/ct', upload.single('image'), (req, res) => {
    handleAnalysis(req, res, 'ct');
});

// Lab report analysis endpoint
app.post('/api/analyze/lab-report', upload.single('image'), (req, res) => {
    handleAnalysis(req, res, 'labReport');
});

// Skin disease detection endpoint
app.post('/api/analyze/skin', upload.single('image'), (req, res) => {
    handleAnalysis(req, res, 'skin');
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 10MB.'
            });
        }
    }

    res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   Medical Image Analysis Service                          ║
║   Powered by Llama 4 Scout Vision Model (Groq API)        ║
║   Running on: http://localhost:${PORT}                       ║
║   Status: Ready to analyze medical images                 ║
╚════════════════════════════════════════════════════════════╝

Available endpoints:
  POST /api/analyze/xray        - X-Ray analysis
  POST /api/analyze/mri         - MRI scan analysis
  POST /api/analyze/ct          - CT scan analysis
  POST /api/analyze/lab-report  - Lab report analysis
  POST /api/analyze/skin        - Skin disease detection
  GET  /health                  - Health check
  `);
});
