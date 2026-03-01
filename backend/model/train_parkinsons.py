"""
Parkinson's Disease Detection — Training Script
=================================================
Binary classification: 1 = Parkinson's, 0 = Healthy
Features: Voice measurement features (MDVP, Jitter, Shimmer, etc.)

Dataset: parkinsons.csv (UCI Parkinson's Dataset)
"""

import logging
import os
import joblib

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report, confusion_matrix,
    accuracy_score, roc_auc_score
)
from sklearn.pipeline import Pipeline

# ── Config ─────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

DATA_PATH = os.path.join("backend", "datasets", "parkinsons", "parkinsons.csv")
MODEL_DIR  = os.path.join("backend", "model")
MODEL_PATH = os.path.join(MODEL_DIR, "parkinsons_model.pkl")

TARGET_COL = "status"   # 1 = Parkinson's, 0 = Healthy
DROP_COLS  = ["name"]   # non-feature columns

RANDOM_STATE = 42
TEST_SIZE    = 0.2

# ── Load & Prepare ─────────────────────────────────────────────────────────────
if __name__ == "__main__":

    log.info("Loading dataset...")
    df = pd.read_csv(DATA_PATH)

    log.info(f"Shape: {df.shape}")
    log.info(f"Class distribution:\n{df[TARGET_COL].value_counts().to_string()}")

    # Drop non-numeric / identifier columns
    df.drop(columns=[c for c in DROP_COLS if c in df.columns], inplace=True)
    df.dropna(inplace=True)

    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]

    log.info(f"Features: {X.shape[1]} | Samples: {X.shape[0]}")

    # ── Train / Test Split (stratified) ───────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y          # preserve class ratio in both splits
    )
    log.info(f"Train: {len(X_train)} | Test: {len(X_test)}")

    # ── Define Models ──────────────────────────────────────────────────────────────
    # SVM works exceptionally well on this dataset
    svm = Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    SVC(kernel="rbf", C=10, gamma=0.01, probability=True, random_state=RANDOM_STATE)),
    ])

    rf = Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    RandomForestClassifier(n_estimators=200, max_depth=6, random_state=RANDOM_STATE, class_weight="balanced")),
    ])

    gb = Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    GradientBoostingClassifier(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=RANDOM_STATE)),
    ])

    # Voting ensemble — combines all 3 for robustness
    ensemble = VotingClassifier(
        estimators=[("svm", svm), ("rf", rf), ("gb", gb)],
        voting="soft"
    )

    models = {
        "SVM":      svm,
        "Random Forest": rf,
        "Gradient Boosting": gb,
        "Ensemble": ensemble,
    }

    # ── Cross-Validation Comparison ────────────────────────────────────────────────
    log.info("\nRunning 5-Fold Cross-Validation on training set...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    cv_results = {}
    for name, model in models.items():
        scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy")
        cv_results[name] = scores
        log.info(f"  {name:20s} → {scores.mean():.4f} ± {scores.std():.4f}")

    # ── Pick Best Model ────────────────────────────────────────────────────────────
    best_name = max(cv_results, key=lambda k: cv_results[k].mean())
    best_model = models[best_name]
    log.info(f"\nBest model: {best_name}")

    # ── Final Training ─────────────────────────────────────────────────────────────
    log.info("Training best model on full training set...")
    best_model.fit(X_train, y_train)

    # ── Evaluation ─────────────────────────────────────────────────────────────────
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1]

    print("\n" + "="*55)
    print(f"  EVALUATION — {best_name}")
    print("="*55)
    print(classification_report(y_test, y_pred, target_names=["Healthy", "Parkinson's"]))

    cm = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:")
    print(f"  TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"  FN={cm[1,0]}  TP={cm[1,1]}")
    print(f"\nAccuracy : {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC  : {roc_auc_score(y_test, y_prob):.4f}")

    # ── Feature Importance (if RF or GB is best) ───────────────────────────────────
    if best_name in ("Random Forest", "Gradient Boosting"):
        clf = best_model.named_steps["clf"]
        importances = pd.Series(clf.feature_importances_, index=X.columns)
        top10 = importances.sort_values(ascending=False).head(10)
        print("\nTop 10 Important Features:")
        print(top10.to_string())

    # ── Save ───────────────────────────────────────────────────────────────────────
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(list(X.columns), os.path.join(MODEL_DIR, "feature_names.pkl"))

    log.info(f"\n✅ Model saved to {MODEL_PATH}")