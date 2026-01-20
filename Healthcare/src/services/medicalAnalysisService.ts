import axios from 'axios';

const API_BASE_URL = 'https://healthcarefinal-qxvr.onrender.com/api';

export interface AnalysisResponse {
    success: boolean;
    analysisType: string;
    analysis: string;
    structured: {
        fullAnalysis: string;
        sections: string[];
        summary: string;
    };
    model: string;
    timestamp: string;
    error?: string;
}

export interface AnalysisError {
    success: false;
    error: string;
    details?: string;
}

class MedicalAnalysisService {
    private async analyzeImage(
        file: File,
        endpoint: string
    ): Promise<AnalysisResponse> {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post<AnalysisResponse>(
                `${API_BASE_URL}${endpoint}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 60000, // 60 second timeout
                }
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Server responded with error
                throw new Error(
                    error.response.data?.error || 'Analysis failed. Please try again.'
                );
            } else if (error.request) {
                // Request made but no response
                throw new Error(
                    'Unable to connect to analysis service. Please ensure the backend is running.'
                );
            } else {
                // Something else happened
                throw new Error(error.message || 'An unexpected error occurred');
            }
        }
    }

    async analyzeXRay(file: File): Promise<AnalysisResponse> {
        return this.analyzeImage(file, '/analyze/xray');
    }

    async analyzeMRI(file: File): Promise<AnalysisResponse> {
        return this.analyzeImage(file, '/analyze/mri');
    }

    async analyzeCT(file: File): Promise<AnalysisResponse> {
        return this.analyzeImage(file, '/analyze/ct');
    }

    async analyzeLabReport(file: File): Promise<AnalysisResponse> {
        return this.analyzeImage(file, '/analyze/lab-report');
    }

    async analyzeSkin(file: File): Promise<AnalysisResponse> {
        return this.analyzeImage(file, '/analyze/skin');
    }

    async checkHealth(): Promise<{ status: string; message: string }> {
        try {
            const response = await axios.get(`http://localhost:3002/health`);
            return response.data;
        } catch (error) {
            throw new Error('Backend service is not available');
        }
    }
}

export const medicalAnalysisService = new MedicalAnalysisService();
