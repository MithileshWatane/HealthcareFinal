import numpy as np

# Model expects input shape: (batch, 64, 8, 3)
WINDOW = 64 * 8  # 512 samples total
STRIDE = 512     # non-overlapping windows
MAX_WINDOWS = 50

def preprocess_eeg(signal):
    signal = np.array(signal, dtype=np.float32)  # float32 is faster than float64
    
    windows = []
    for i in range(0, len(signal) - WINDOW, STRIDE):
        segment = signal[i:i + WINDOW]
        segment = (segment - segment.mean()) / segment.std()
        reshaped = segment[:512].reshape(64, 8)
        reshaped = np.stack([reshaped, reshaped, reshaped], axis=-1)
        windows.append(reshaped)
        if len(windows) >= MAX_WINDOWS:
            break

    return np.array(windows, dtype=np.float32)
