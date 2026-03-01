import joblib
import os
from backend.database.logger import log_prediction

MODEL_PATH = os.path.join("backend", "model", "fake_news_pipeline.pkl")

pipeline = joblib.load(MODEL_PATH)


def predict_fake_news(input_data):
    text = input_data.get("text", "")

    if not text.strip():
        return {"error": "Text cannot be empty"}

    prediction = pipeline.predict([text])[0]

    confidence = None
    if hasattr(pipeline["clf"], "predict_proba"):
        proba = pipeline.predict_proba([text])[0]
        confidence = float(max(proba))

    label = "real" if prediction == 1 else "fake"

    log_prediction(
        model_name="fake_news",
        input_data=input_data,
        prediction=label,
        confidence=confidence if confidence else 0.99
    )

    return {
        "model": "fake_news",
        "prediction": label,
        "confidence": round(confidence, 4) if confidence else None
    }