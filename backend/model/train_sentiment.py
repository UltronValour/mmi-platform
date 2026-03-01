import pandas as pd
import joblib
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# ======================
# File Paths
# ======================
train_path = os.path.join("backend", "datasets", "sentiment", "train.csv")
val_path = os.path.join("backend", "datasets", "sentiment", "validation.csv")

# ======================
# Load Datasets (NO HEADER)
# ======================
train_df = pd.read_csv(train_path, header=None)
val_df = pd.read_csv(val_path, header=None)

# Assign correct column names
train_df.columns = ["id", "entity", "sentiment", "text"]
val_df.columns = ["id", "entity", "sentiment", "text"]

print("Train columns:", train_df.columns)
print("Validation columns:", val_df.columns)

# ======================
# Keep Required Columns
# ======================
train_df = train_df[["text", "sentiment"]]
val_df = val_df[["text", "sentiment"]]

# ======================
# Clean Data
# ======================
train_df.dropna(inplace=True)
val_df.dropna(inplace=True)

train_df["sentiment"] = train_df["sentiment"].str.lower().str.strip()
val_df["sentiment"] = val_df["sentiment"].str.lower().str.strip()

# ======================
# TF-IDF Vectorization
# ======================
vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=5000
)

X_train_vec = vectorizer.fit_transform(train_df["text"])
X_val_vec = vectorizer.transform(val_df["text"])

y_train = train_df["sentiment"]
y_val = val_df["sentiment"]

# ======================
# Model Training
# ======================
model = LogisticRegression(max_iter=200)
model.fit(X_train_vec, y_train)

# ======================
# Evaluation
# ======================
y_pred = model.predict(X_val_vec)
print("\nClassification Report:\n")
print(classification_report(y_val, y_pred))

# ======================
# Save Model + Vectorizer
# ======================
model_dir = os.path.join("backend", "model")
os.makedirs(model_dir, exist_ok=True)

model_path = os.path.join(model_dir, "sentiment_model.pkl")
vectorizer_path = os.path.join(model_dir, "sentiment_vectorizer.pkl")

joblib.dump(model, model_path)
joblib.dump(vectorizer, vectorizer_path)

print(f"\nModel saved at: {model_path}")
print(f"Vectorizer saved at: {vectorizer_path}")
print("\n✅ Training completed successfully")