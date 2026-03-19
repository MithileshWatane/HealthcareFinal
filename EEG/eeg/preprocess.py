import numpy as np
from scipy.signal import butter, filtfilt, detrend
import librosa
from .constants import *

def bandpass(x, low=1, high=45, fs=FS):
    b, a = butter(4, [low/(fs/2), high/(fs/2)], btype="band")
    return filtfilt(b, a, x)

def load_eeg_from_array(x):
    if x.ndim == 1:
        x = x.reshape(-1, 3)
    x = x[:, :3]

    for i in range(3):
        x[:, i] = detrend(x[:, i])
        x[:, i] = bandpass(x[:, i])
        x[:, i] = (x[:, i] - x[:, i].mean()) / (x[:, i].std() + 1e-8)
    return x

def compute_mel(epoch):
    specs = []
    for ch in range(3):
        mel = librosa.feature.melspectrogram(
            y=epoch[:, ch],
            sr=FS,
            n_fft=FFT,
            hop_length=HOP,
            n_mels=N_MELS
        )
        mel = librosa.power_to_db(mel, ref=np.max)
        specs.append(mel)
    return np.stack(specs, axis=-1)

def create_epochs(x):
    epochs = []
    for i in range(len(x) // SAMPLES_PER_EPOCH):
        seg = x[i*SAMPLES_PER_EPOCH:(i+1)*SAMPLES_PER_EPOCH]
        spec = compute_mel(seg)
        spec = (spec - spec.mean()) / (spec.std() + 1e-8)
        epochs.append(spec)
    return np.array(epochs)
