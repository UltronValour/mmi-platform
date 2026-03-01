import os
import joblib

FEATURE_PATH = os.path.join("backend", "model", "feature_names.pkl")

def get_parkinsons_features():
    return joblib.load(FEATURE_PATH)