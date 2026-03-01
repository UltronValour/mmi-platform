import joblib
import os
from backend.model.movie_recommender_class import MovieRecommender
from backend.database.logger import log_prediction
import json

MODEL_PATH = os.path.join("backend", "model", "movie_recommender.pkl")

_recommender = None


def _get_recommender():
    global _recommender
    if _recommender is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                "Run: python -m backend.model.train_movie_recommender"
            )
        _recommender = joblib.load(MODEL_PATH)
    return _recommender


def get_recommendations(title: str):
    results = _get_recommender().recommend(title, n=5)
    
    # Log the prediction
    log_prediction(
        "movie",
        title,
        json.dumps(results.to_dict(orient="records")),
        "success"
    )
    
    return results.to_dict(orient="records")


def get_genre_recommendations(genre: str):
    results = _get_recommender().recommend_by_genre(genre, n=5)
    records = results.to_dict(orient="records")

    log_prediction(
        "movie_genre",
        genre,
        json.dumps(records),
        "success"
    )

    return records