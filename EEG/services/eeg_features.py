import numpy as np
from scipy.signal import butter, filtfilt

def bandpass(data, low, high, fs):
    nyq = fs / 2
    b, a = butter(4, [low / nyq, high / nyq], btype="band")
    return filtfilt(b, a, data)

def extract_band_powers(signal, fs):
    bands = {
        "delta": (0.5, 4),
        "theta": (4, 8),
        "alpha": (8, 13),
        "beta": (13, 30),
    }

    results = {}
    for band, (l, h) in bands.items():
        filtered = bandpass(signal, l, h, fs)
        power = float(np.mean(filtered ** 2) * 100)
        results[band] = {
            "power": round(power, 2),
            "status": "elevated" if power > 40 else "normal"
        }

    return results

def extract_band_powers_timeseries(signal, fs, window_size=512, stride=256):
    """Extract band powers over time windows for visualization"""
    bands = {
        "delta": (0.5, 4),
        "theta": (4, 8),
        "alpha": (8, 13),
        "beta": (13, 30),
    }
    
    timeseries = []
    
    for i in range(0, len(signal) - window_size, stride):
        segment = signal[i:i + window_size]
        time_point = {"time": i // stride}
        
        for band, (l, h) in bands.items():
            filtered = bandpass(segment, l, h, fs)
            power = float(np.mean(filtered ** 2) * 100)
            time_point[band] = round(power, 2)
        
        timeseries.append(time_point)
    
    return timeseries
