from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.eeg_loader import load_eeg
from services.eeg_preprocessing import preprocess_eeg
from services.eeg_features import extract_band_powers, extract_band_powers_timeseries
from models.transformer_loader import predict_eeg
from models.attention import get_attention_map

app = FastAPI(title="AI EEG Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/eeg/analyze")
async def analyze_eeg(file: UploadFile = File(...)):
    signal, fs = await load_eeg(file)
    eeg_windows = preprocess_eeg(signal)

    prediction, confidence = predict_eeg(eeg_windows)
    attention = get_attention_map(eeg_windows)

    bands = extract_band_powers(signal, fs)
    band_timeseries = extract_band_powers_timeseries(signal, fs)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "bands": bands,
        "band_timeseries": band_timeseries,
        "attention_map": attention
    }
