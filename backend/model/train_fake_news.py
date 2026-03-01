import os
import logging
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.utils import shuffle

# ======================
# Config
# ======================
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

FAKE_PATH = os.path.join("backend", "datasets", "fake_news", "Fake.csv")
TRUE_PATH = os.path.join("backend", "datasets", "fake_news", "True.csv")
MODEL_DIR = os.path.join("backend", "model")
MODEL_PATH = os.path.join(MODEL_DIR, "fake_news_pipeline.pkl")

TEST_SIZE = 0.2
RANDOM_STATE = 42


# ======================
# Load & Prepare Data
# ======================
def load_data(fake_path: str, true_path: str) -> pd.DataFrame:
    """Load and merge fake/real news datasets."""
    log.info("Loading datasets...")

    fake_df = pd.read_csv(fake_path)
    true_df = pd.read_csv(true_path)

    fake_df["label"] = 0  # fake
    true_df["label"] = 1  # real

    df = pd.concat([fake_df, true_df], ignore_index=True)
    df = shuffle(df, random_state=RANDOM_STATE).reset_index(drop=True)

    log.info(f"Total samples: {len(df)} | Fake: {(df['label']==0).sum()} | Real: {(df['label']==1).sum()}")
    return df


def build_features(df: pd.DataFrame) -> pd.Series:
    """Combine title + text for richer features."""
    title = df["title"].fillna("") if "title" in df.columns else ""
    text = df["text"].fillna("")
    return (title + " " + text).str.strip()


# ======================
# Build Pipeline
# ======================
def build_pipeline() -> Pipeline:
    return Pipeline([
        ("tfidf", TfidfVectorizer(
            stop_words="english",
            max_df=0.7,
            min_df=2,           # ignore very rare terms
            ngram_range=(1, 2), # unigrams + bigrams
            sublinear_tf=True,  # dampen extreme term frequencies
        )),
        ("clf", PassiveAggressiveClassifier(
            max_iter=1000,
            tol=1e-3,
            random_state=RANDOM_STATE,
            class_weight="balanced",  # handle any class imbalance
        )),
    ])


# ======================
# Evaluate
# ======================
def evaluate(pipeline: Pipeline, X_test: pd.Series, y_test: pd.Series) -> None:
    y_pred = pipeline.predict(X_test)

    print("\n" + "="*50)
    print("CLASSIFICATION REPORT")
    print("="*50)
    print(classification_report(y_test, y_pred, target_names=["Fake", "Real"]))

    cm = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:")
    print(f"  TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"  FN={cm[1,0]}  TP={cm[1,1]}")
    print(f"\nOverall Accuracy: {accuracy_score(y_test, y_pred):.4f}")


# ======================
# Main
# ======================
def main():
    # Load data
    df = load_data(FAKE_PATH, TRUE_PATH)
    df.dropna(subset=["text"], inplace=True)

    X = build_features(df)
    y = df["label"]

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    log.info(f"Train: {len(X_train)} | Test: {len(X_test)}")

    # Build & train
    log.info("Training pipeline...")
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    # Cross-validation on training set
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="accuracy")
    log.info(f"5-Fold CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Evaluate on held-out test set
    evaluate(pipeline, X_test, y_test)

    # Save single pipeline file
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    log.info(f"✅ Pipeline saved to {MODEL_PATH}")


# ======================
# Inference helper
# ======================
def predict(text: str, model_path: str = MODEL_PATH) -> dict:
    """Load saved pipeline and predict a single article."""
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")

    pipeline = joblib.load(model_path)
    label = pipeline.predict([text])[0]
    proba = pipeline.predict_proba([text])[0] if hasattr(pipeline["clf"], "predict_proba") else None

    return {
        "label": "real" if label == 1 else "fake",
        "confidence": round(float(max(proba)), 4) if proba is not None else None,
    }


if __name__ == "__main__":
    main()