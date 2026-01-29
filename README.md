# 🏥 MedCare AI - Comprehensive Healthcare Platform

<div align="center">

![MedCare AI Dashboard](./Images/WhatsApp%20Image%202026-01-29%20at%207.52.27%20PM.jpeg)

**An AI-powered healthcare platform providing intelligent medical assistance, diagnostics, and health monitoring**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18.0-orange.svg)](https://www.tensorflow.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**MedCare AI** is a cutting-edge healthcare platform that leverages artificial intelligence to provide comprehensive medical assistance. The platform combines multiple AI models and services to deliver:

- **Instant Medical Guidance** through an AI-powered chatbot
- **Advanced Diagnostics** using computer vision for medical imaging
- **Health Monitoring** with wearable data integration
- **Mental Health Support** with AI-assisted screening
- **Preventive Care** through lifestyle analysis and predictions

The platform is designed to make healthcare more accessible, efficient, and personalized for everyone.

---

## ✨ Features

### 🤖 **Medical Q&A Chatbot**
- AI-powered assistant using Google Gemini and RAG (Retrieval-Augmented Generation)
- Instant answers to medical questions
- Context-aware responses based on medical literature
- Chat history and conversation management

### 🔬 **Medical Image Analysis**
- **X-Ray Analysis**: AI-powered interpretation of chest X-rays
- **MRI Scan Analysis**: Advanced MRI image processing
- **CT Scan Analysis**: Detailed CT scan evaluation
- **Lab Report Interpretation**: Automated lab result analysis
- Powered by Meta's Llama 4 Scout vision model via Groq API

### 🧠 **Tumor Detection**
- Brain tumor detection from MRI scans
- ResUNet architecture for tumor segmentation
- ResNet model for tumor classification
- Real-time analysis with confidence scores
- Flask backend service for model inference

### 🎨 **Skin Disease Detection**
- Upload skin images for AI-powered disease identification
- Multi-class classification for various skin conditions
- Instant diagnostic suggestions
- Treatment recommendations

### 🗓️ **Appointment Booking**
- Schedule doctor visits based on real-time availability
- Specialty-based doctor search
- Automated reminders and notifications
- Calendar integration

### ⌚ **Health Prediction**
- Wearable data integration (sleep, steps, water intake, calories)
- Preventive health insights
- Personalized health recommendations
- Trend analysis and predictions

### 🎤 **Voice Consultation**
- Real-time voice-to-text transcription
- AI-assisted consultation notes
- Automatic prescription generation
- PDF export functionality
- ElevenLabs integration for voice synthesis

### 📊 **Mental Health Analytics**
- AI-assisted mental health screening
- Mood stability tracking
- Stress resilience monitoring
- Burnout risk assessment
- Gamified activities and daily check-ins
- Cognitive fatigue analysis

### 📁 **Health Records Management**
- Secure, centralized storage for medical records
- QR code generation for quick access
- HIPAA-compliant data encryption
- Easy sharing with healthcare providers
- Complete medical history tracking

### 🔔 **Alerts & Task Management**
- Medication reminders
- Test and appointment notifications
- Todo list with medicine tracking (name, dosage, time)
- Task categorization: To Complete, In Progress, Completed
- Supabase integration for data persistence

### 📈 **Lifestyle Analysis**
- Daily habit tracking (sleep, steps, water, calories)
- Activity overview and patterns
- AI-powered recommendations
- Weekly goals and progress tracking
- Personalized wellness insights

### 🧪 **Signal Analysis**
- EEG signal processing and analysis
- Audio signal analysis for health monitoring
- Real-time signal visualization
- Anomaly detection

### 👤 **User Profile Management**
- Comprehensive medical profile
- Personal information management
- Medical history tracking
- QR code for emergency access
- Privacy and security controls

---

## 📸 Screenshots

### Dashboard & Profile
![Dashboard](./Images/WhatsApp%20Image%202026-01-29%20at%207.52.27%20PM.jpeg)
*Main dashboard with personal info, medical history, lifestyle tracking, and mental health analytics*

### Lifestyle Analysis
![Lifestyle Analysis](./Images/WhatsApp%20Image%202026-01-29%20at%207.52.57%20PM.jpeg)
*Track daily habits including sleep, steps, water intake, and calories with AI recommendations*

### Mental Health Analytics
![Mental Health](./Images/WhatsApp%20Image%202026-01-29%20at%207.53.30%20PM.jpeg)
*Comprehensive mental health tracking with mood stability, stress resilience, and burnout risk assessment*

### Medical Profile
![Medical Profile](./Images/WhatsApp%20Image%202026-01-29%20at%207.53.50%20PM.jpeg)
*Complete medical profile with QR code generation for emergency access*

### Medical Q&A Chatbot
![Chatbot](./Images/WhatsApp%20Image%202026-01-29%20at%207.54.17%20PM.jpeg)
*AI-powered medical chatbot with quick questions and chat history*

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.4.1
- **UI Library**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 6.30.1
- **Animations**: Framer Motion 12.26.1
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts 2.15.4
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Generative AI (Gemini)

### **Backend Services**

#### **Main Backend** (`/backend`)
- **Framework**: Flask 3.0.0
- **CORS**: Flask-CORS 4.0.0
- **Deep Learning**: TensorFlow 2.18.0
- **Image Processing**: Pillow 10.1.0
- **Numerical Computing**: NumPy 1.26.4
- **Model Storage**: H5py 3.11.0

#### **RAG Chatbot** (`/Ragbot`)
- **Framework**: Flask
- **LLM**: Google Gemini via LangChain
- **Vector Store**: Pinecone
- **Embeddings**: Google Generative AI Embeddings
- **Document Processing**: PyPDF for medical literature

#### **EEG Analysis** (`/EEG`)
- **Framework**: FastAPI
- **Signal Processing**: Custom EEG analysis pipeline
- **Audio Processing**: Audio signal analysis utilities

#### **Tumor Detection** (`/Tumour detection`)
- **Deep Learning Models**: 
  - ResUNet for tumor segmentation
  - ResNet for tumor classification
- **Framework**: TensorFlow/Keras
- **Image Processing**: OpenCV, Pillow

---

## 📁 Project Structure

```
Healthcare/
├── Healthcare/                 # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript type definitions
│   │   ├── lib/              # Utility functions
│   │   └── hooks/            # Custom React hooks
│   ├── public/               # Static assets
│   ├── supabase/             # Supabase configuration
│   └── package.json          # Frontend dependencies
│
├── backend/                   # Main Flask backend
│   ├── tumor_detection_service.py  # Tumor detection API
│   ├── convert_models.py     # Model conversion utilities
│   ├── test_model_loading.py # Model testing scripts
│   └── requirements.txt      # Python dependencies
│
├── Ragbot/                    # RAG-based medical chatbot
│   ├── app.py                # Flask application
│   ├── store_index.py        # Vector store management
│   ├── src/                  # Source code
│   ├── data/                 # Medical literature data
│   ├── templates/            # HTML templates
│   └── static/               # Static files
│
├── EEG/                       # EEG signal analysis service
│   ├── main.py               # FastAPI application
│   ├── models/               # ML models
│   ├── services/             # Business logic
│   ├── schemas/              # Data schemas
│   └── utils/                # Utility functions
│
├── Tumour detection/          # Tumor detection models
│   ├── models/               # Trained models (ResUNet, ResNet)
│   ├── preprocessing/        # Image preprocessing
│   └── inference/            # Model inference scripts
│
├── qr/                        # QR code generation service
│
├── Document/                  # Documentation files
│
├── Images/                    # Screenshots and assets
│
└── README.md                  # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher) and npm
- **Python** (v3.10 or higher)
- **Git**
- **Supabase Account** (for database)
- **Google AI API Key** (for Gemini)
- **Groq API Key** (for Llama 4 Scout)
- **Pinecone API Key** (for RAG chatbot)

### 1️⃣ Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd Healthcare
```

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd Healthcare

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables to .env
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_GOOGLE_AI_API_KEY=your_gemini_api_key
# VITE_GROQ_API_KEY=your_groq_api_key

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3️⃣ Backend Setup (Tumor Detection Service)

```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python tumor_detection_service.py
```

The backend will be available at `http://localhost:5001`

### 4️⃣ RAG Chatbot Setup

```bash
# Navigate to Ragbot directory
cd ../Ragbot

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file and add:
# GOOGLE_API_KEY=your_gemini_api_key
# PINECONE_API_KEY=your_pinecone_api_key

# Store the vector index (first time only)
python store_index.py

# Start the Flask server
python app.py
```

The RAG chatbot will be available at `http://localhost:5000`

### 5️⃣ EEG Analysis Service Setup

```bash
# Navigate to EEG directory
cd ../EEG

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

### 6️⃣ Quick Start (All Services)

For Windows users, you can use the provided batch file:

```bash
# From the root directory
start_tumor_backend.bat
```

This will start the tumor detection backend service automatically.

---

## 💻 Usage

### Starting the Application

1. **Start Frontend**:
   ```bash
   cd Healthcare
   npm run dev
   ```

2. **Start Tumor Detection Backend**:
   ```bash
   cd backend
   python tumor_detection_service.py
   ```

3. **Start RAG Chatbot**:
   ```bash
   cd Ragbot
   python app.py
   ```

4. **Start EEG Service** (optional):
   ```bash
   cd EEG
   python main.py
   ```

### Using the Features

#### Medical Q&A Chatbot
1. Navigate to the Chatbot page
2. Type your medical question
3. Get instant AI-powered responses
4. View chat history and quick questions

#### Tumor Detection
1. Navigate to Tumor Detection page
2. Upload an MRI scan image
3. Wait for AI analysis
4. View segmentation results and classification

#### Skin Disease Detection
1. Go to Skin Detection page
2. Upload a skin image
3. Receive AI diagnosis and recommendations

#### Health Records
1. Complete your medical profile
2. Upload medical documents
3. Generate QR code for emergency access
4. Share with healthcare providers

#### Mental Health Analytics
1. Complete daily check-ins
2. Play gamified activities
3. View mental health scores
4. Track mood and stress levels

#### Lifestyle Analysis
1. Input daily metrics (sleep, steps, water, calories)
2. View activity patterns
3. Get AI recommendations
4. Track weekly goals

---

## 📚 API Documentation

### Tumor Detection API

**Endpoint**: `POST /analyze`

**Request**:
```json
{
  "image": "base64_encoded_image"
}
```

**Response**:
```json
{
  "success": true,
  "prediction": "Tumor Detected",
  "confidence": 0.95,
  "segmentation_map": "base64_encoded_segmentation",
  "tumor_area": 1234.56
}
```

### RAG Chatbot API

**Endpoint**: `POST /chat`

**Request**:
```json
{
  "question": "What are the symptoms of flu?",
  "chat_history": []
}
```

**Response**:
```json
{
  "answer": "The symptoms of flu include...",
  "sources": ["source1.pdf", "source2.pdf"]
}
```

### Medical Image Analysis API

**Endpoint**: `POST /api/analyze-image`

**Request**:
```json
{
  "image": "base64_encoded_image",
  "type": "xray" | "mri" | "ct" | "lab" | "skin"
}
```

**Response**:
```json
{
  "analysis": "Detailed AI analysis...",
  "findings": ["finding1", "finding2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
```

---

## 🤝 Contributing

We welcome contributions to MedCare AI! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write clean, documented code
- Test your changes thoroughly
- Update documentation as needed
- Follow the existing code style

---

## 🔒 Security & Privacy

- **HIPAA Compliant**: All medical data is encrypted and stored securely
- **Data Encryption**: End-to-end encryption for sensitive information
- **Secure Authentication**: Supabase authentication with row-level security
- **Privacy Controls**: Users have full control over their data
- **No Data Sharing**: Medical information is never shared without consent

---

<div align="center">

⭐ Star us on GitHub if you find this project useful!

</div>
