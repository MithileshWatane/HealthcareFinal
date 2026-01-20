import numpy as np
import pandas as pd
from fastapi import UploadFile
from io import StringIO

async def load_eeg(file: UploadFile):
    contents = await file.read()
    
    # Try to detect delimiter and parse CSV
    try:
        # Try with automatic delimiter detection
        df = pd.read_csv(StringIO(contents.decode()), sep=r'\s+|,', engine='python')
    except:
        # Fallback to comma-separated
        df = pd.read_csv(StringIO(contents.decode()))
    
    # Flatten all columns into a single signal array
    signal = df.values.flatten()
    
    fs = 256
    return signal, fs
