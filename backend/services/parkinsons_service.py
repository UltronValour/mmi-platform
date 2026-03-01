import os
import joblib
import numpy as np
from backend.database.logger import log_prediction

MODEL_PATH = os.path.join("backend", "model", "parkinsons_model.pkl")
FEATURE_PATH = os.path.join("backend", "model", "feature_names.pkl")

_model = None
_features = None


def _load():
    global _model, _features
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _features = joblib.load(FEATURE_PATH)


def predict_parkinsons(input_data: dict):
    _load()

    # Ensure all required features present
    try:
        values = [input_data[f] for f in _features]
    except KeyError as e:
        return {"error": f"Missing feature: {str(e)}"}, 400

    X = np.array(values).reshape(1, -1)

    pred = _model.predict(X)[0]
    prob = _model.predict_proba(X)[0].max()
    label = "parkinsons" if pred == 1 else "healthy"

    log_prediction(
        model_name="parkinsons",
        input_data=input_data,
        prediction=label,
        confidence=round(float(prob), 4)
    )

    return {
        "model": "parkinsons",
        "prediction": label,
        "confidence": round(float(prob), 4),
    }