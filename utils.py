import pickle
import pandas as pd

def load_model(file_path):
    """Load a trained ML model from a .pkl file."""
    with open(file_path, 'rb') as f:
        model = pickle.load(f)
    return model

def load_data(file_path):
    """Load a dataset from a CSV file."""
    return pd.read_csv(file_path)
