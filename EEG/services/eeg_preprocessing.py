import numpy as np

# Model expects input shape: (batch, 64, 8, 3)
WINDOW = 64 * 8  # 512 samples total
STRIDE = 256

def preprocess_eeg(signal):
    # Ensure signal is float type for normalization
    signal = np.array(signal, dtype=np.float64)
    
    windows = []
    for i in range(0, len(signal) - WINDOW, STRIDE):
        segment = signal[i:i + WINDOW]
        segment = (segment - segment.mean()) / segment.std()
        
        # Reshape to (64, 8) then add channel dimension for (64, 8, 1)
        # Then tile to create 3 channels: (64, 8, 3)
        reshaped = segment[:512].reshape(64, 8)
        # Stack 3 times along last axis to create 3 channels
        reshaped = np.stack([reshaped, reshaped, reshaped], axis=-1)
        
        windows.append(reshaped)

    return np.array(windows)
