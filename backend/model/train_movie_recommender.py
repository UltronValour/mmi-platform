"""
Movie Recommendation System
============================
Content-based filtering using:
  - TF-IDF on movie overviews
  - Genre overlap (Jaccard similarity)
  - Weighted cosine similarity

Usage:
    python movie_recommender.py
    >>> recommend("The Godfather")
"""

import ast
import logging
import os
import sys
import joblib
from backend.model.movie_recommender_class import MovieRecommender

# Ensure stdout handles Unicode on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack, csr_matrix

# ── Config ─────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

DATA_PATH = os.path.join("backend", "datasets", "movies", "top_rated_movies.csv")
MODEL_DIR   = os.path.join("backend", "model")
MODEL_PATH  = os.path.join(MODEL_DIR, "movie_recommender.pkl")

# Weight for combining overview similarity vs genre similarity
OVERVIEW_WEIGHT = 0.7
GENRE_WEIGHT    = 0.3

# ── Genre ID → Name mapping (TMDB standard) ────────────────────────────────────
GENRE_MAP = {
    28: "action", 12: "adventure", 16: "animation", 35: "comedy",
    80: "crime", 99: "documentary", 18: "drama", 10751: "family",
    14: "fantasy", 36: "history", 27: "horror", 10402: "music",
    9648: "mystery", 10749: "romance", 878: "science_fiction",
    10770: "tv_movie", 53: "thriller", 10752: "war", 37: "western",
}


# ── Data Loading ───────────────────────────────────────────────────────────────
def load_data(path: str) -> pd.DataFrame:
    log.info(f"Loading data from {path}...")
    df = pd.read_csv(path, index_col=0)

    df.drop_duplicates(subset="title", keep="first", inplace=True)
    df.dropna(subset=["overview"], inplace=True)
    df.reset_index(drop=True, inplace=True)

    # Parse genre_ids from string representation
    df["genre_ids"] = df["genre_ids"].apply(
        lambda x: ast.literal_eval(x) if isinstance(x, str) else []
    )
    df["genres"] = df["genre_ids"].apply(
        lambda ids: [GENRE_MAP.get(i, str(i)) for i in ids]
    )
    df["genres_str"] = df["genres"].apply(lambda g: " ".join(g))

    # Normalise popularity & vote scores for potential use
    df["year"] = pd.to_datetime(df["release_date"], errors="coerce").dt.year

    log.info(f"Loaded {len(df)} movies.")
    return df


# ── Feature Matrix ─────────────────────────────────────────────────────────────
def build_feature_matrix(df: pd.DataFrame):
    """
    Returns a combined sparse matrix: weighted overview TF-IDF + genre TF-IDF.
    """
    log.info("Building TF-IDF on overviews...")
    tfidf_overview = TfidfVectorizer(
        stop_words="english",
        max_df=0.85,
        min_df=2,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )
    overview_matrix = tfidf_overview.fit_transform(df["overview"])

    log.info("Building TF-IDF on genres...")
    tfidf_genre = TfidfVectorizer()
    genre_matrix = tfidf_genre.fit_transform(df["genres_str"])

    # Weighted combination
    combined = hstack([
        overview_matrix * OVERVIEW_WEIGHT,
        genre_matrix    * GENRE_WEIGHT,
    ])

    return combined, tfidf_overview, tfidf_genre



# ── Save / Load ────────────────────────────────────────────────────────────────
def save_recommender(recommender: MovieRecommender, path: str = MODEL_PATH):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(recommender, path)
    log.info(f"✅ Recommender saved to {path}")


def load_recommender(path: str = MODEL_PATH) -> MovieRecommender:
    if not os.path.exists(path):
        raise FileNotFoundError(f"No saved model at {path}. Run main() first.")
    return joblib.load(path)


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    df = load_data(DATA_PATH)
    feature_matrix, *_ = build_feature_matrix(df)

    recommender = MovieRecommender(df, feature_matrix)
    save_recommender(recommender)

    # ── Demo ───────────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("[Movie]  Similar to: The Godfather")
    print("="*60)
    print(recommender.recommend("The Godfather", n=5).to_string())

    print("\n" + "="*60)
    print("[Movie]  Similar to: Inception")
    print("="*60)
    print(recommender.recommend("Inception", n=5).to_string())

    print("\n" + "="*60)
    print("[Genre]  Top Drama movies")
    print("="*60)
    print(recommender.recommend_by_genre("drama", n=5).to_string())

    print("\n" + "="*60)
    print("[Blend]  The Dark Knight + Interstellar")
    print("="*60)
    print(recommender.similar_to_multiple(["The Dark Knight", "Interstellar"], n=5).to_string())


if __name__ == "__main__":
    main()