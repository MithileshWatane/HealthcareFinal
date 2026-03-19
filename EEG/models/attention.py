import numpy as np

def get_attention_map(eeg_windows):
    attention = np.mean(np.abs(eeg_windows), axis=-1)
    attention = attention / attention.max()

    return attention.tolist()
