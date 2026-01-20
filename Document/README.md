# Medical Image Analysis Service

AI-powered medical image analysis service using Meta's Llama 4 Scout vision model via Groq API.

## Features

- **X-Ray Analysis**: Detailed radiological analysis of X-ray images
- **MRI Scan Analysis**: Comprehensive MRI scan interpretation
- **CT Scan Analysis**: CT scan evaluation and findings
- **Lab Report Analysis**: Laboratory report interpretation
- **Skin Disease Detection**: Dermatological assessment of skin conditions

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file with your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   PORT=3002
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start Server**:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

All endpoints accept `multipart/form-data` with an `image` field.

### POST /api/analyze/xray
Analyze X-ray images.

### POST /api/analyze/mri
Analyze MRI scans.

### POST /api/analyze/ct
Analyze CT scans.

### POST /api/analyze/lab-report
Analyze lab reports.

### POST /api/analyze/skin
Detect and analyze skin conditions.

### GET /health
Health check endpoint.

## Supported File Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- PDF (.pdf)
- DICOM (.dcm)

**Maximum file size**: 10MB

## Response Format

```json
{
  "success": true,
  "analysisType": "xray",
  "analysis": "Detailed AI-generated analysis...",
  "structured": {
    "fullAnalysis": "...",
    "sections": ["...", "..."],
    "summary": "..."
  },
  "model": "meta-llama/llama-4-scout-17b-16e-instruct",
  "timestamp": "2026-01-15T06:25:00.000Z"
}
```

## Technology Stack

- **Express.js**: Web server framework
- **Groq SDK**: Fast inference for Llama 4 Scout
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

## Important Notes

⚠️ **Medical Disclaimer**: This service provides AI-assisted analysis for informational purposes only. All results should be reviewed by qualified healthcare professionals. This tool does not replace professional medical diagnosis or treatment.

## License

MIT
