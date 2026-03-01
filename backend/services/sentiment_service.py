import joblib
import os
from backend.database.logger import log_prediction

# Load model and vectorizer once
model_path = os.path.join("backend", "model", "sentiment_model.pkl")
vectorizer_path = os.path.join("backend", "model", "sentiment_vectorizer.pkl")

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)


def predict_sentiment(input_data):
    text = input_data.get("text", "")

    # Transform input
    text_vec = vectorizer.transform([text])

    # Predict
    prediction = model.predict(text_vec)[0]

    # Get confidence
    probabilities = model.predict_proba(text_vec)[0]
    confidence = max(probabilities)

    # 🔥 IMPORTANT: Log prediction to DB
    log_prediction(
        model_name="sentiment",
        input_data=input_data,
        prediction=prediction,
        confidence=float(confidence)
    )

    return {
        "model": "sentiment",
        "prediction": prediction,
        "confidence": round(float(confidence), 3),
    }