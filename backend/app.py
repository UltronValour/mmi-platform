from flask import Flask, request
from flask_cors import CORS
from backend.api.routes import route_prediction, get_history_route, clear_history_route
from backend.database.db import init_db
from backend.model.feature_loader import get_parkinsons_features
app = Flask(__name__)
CORS(app)

@app.route("/predict/<model_name>", methods=["POST"])
def predict(model_name):
    return route_prediction(model_name)


@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}

@app.route("/parkinsons/features", methods=["GET"])
def parkinsons_features():
    return {"features": get_parkinsons_features()}


@app.route("/models", methods=["GET"])
def models():
    return {
        "sentiment": "loaded",
        "fake_news": "loaded",
        "movie": "loaded",
        "parkinsons": "loaded"
    }

@app.route("/history", methods=["GET", "DELETE"])
def history():
    if request.method == "DELETE":
        return clear_history_route()
    return get_history_route()
import os

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
