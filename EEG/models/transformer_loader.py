import tensorflow as tf
import numpy as np
import os

# Get absolute path to model directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "transformer_best.keras")

# Lazy load the model
_model = None

def _get_model():
    global _model
    if _model is None:
        # Workaround for Keras 3 Windows directory loading bug
        # Load model from config and weights separately
        import json
        from keras.saving import deserialize_keras_object
        
        config_path = os.path.join(MODEL_PATH, "config.json")
        weights_path = os.path.join(MODEL_PATH, "model.weights.h5")
        
        print(f"Loading model from: {MODEL_PATH}")
        print(f"Config path: {config_path}")
        print(f"Weights path: {weights_path}")
        
        # Load model architecture from config using Keras 3 method
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        # Deserialize the entire config object (not just config['config'])
        _model = deserialize_keras_object(config)
        
        # Load weights
        _model.load_weights(weights_path)
        
        print("Model loaded successfully!")
    return _model

def predict_eeg(eeg_windows):
    model = _get_model()
    preds = model.predict(eeg_windows)
    score = float(np.mean(preds))

    prediction = "MDD" if score > 0.5 else "Healthy"
    confidence = round(score * 100, 2)

    return prediction, confidence
