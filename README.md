# MMI — Multi-Model Interface

> A unified, production-ready dashboard for four Machine Learning models spanning NLP, Healthcare, and Recommendation Systems.

Built with a **React + Vite** frontend and a **Python Flask** backend, MMI makes it easy to interact with complex ML models through a premium, modern UI.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend | [https://mmi-platform.vercel.app](https://mmi-platform.vercel.app) |
| ⚙️ Backend API | [https://mmi-platform.onrender.com](https://mmi-platform.onrender.com) |

---

## 🤖 Models

| Model | Task | Algorithm | Dataset | Accuracy |
|---|---|---|---|---|
| 💬 Sentiment Analysis | Text classification | TF-IDF + Logistic Regression | Twitter Sentiment | 94% |
| 🔍 Fake News Detection | Binary classification | NLP + Classifier | LIAR / WELFake | 91% |
| 🎬 Movie Recommender | Content-based filtering | Cosine Similarity | TMDB / MovieLens | Top-5 |
| 🧬 Parkinson's Detection | Healthcare diagnostics | Random Forest | UCI Parkinson's | 95% |

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- Vanilla CSS3 (Glassmorphism, CSS Variables, Keyframe Animations)
- Axios

**Backend**
- Python 3 + Flask
- Flask-CORS
- scikit-learn, pandas, numpy
- SQLite3 (prediction history logging)
- joblib / pickle (model serialization)

---

## 📁 Project Structure

```
ml-analytics-platform/
├── backend/
│   ├── api/            # Flask route handlers
│   ├── database/       # SQLite connection & logging
│   ├── model/          # .pkl model files & training scripts
│   ├── services/       # ML logic per model
│   └── app.py          # Flask entry point
├── frontend/
│   └── src/
│       ├── components/ # Navbar, Breadcrumb, StatsBar
│       ├── pages/      # Home, Sentiment, FakeNews, Movie, Parkinsons, History
│       ├── api.js      # Central API base URL config
│       └── App.jsx     # Root component + Toast system
├── Procfile            # Render start command
├── requirements.txt    # Python dependencies
└── .gitignore
```

---

## ⚙️ Running Locally

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone the repo
```bash
git clone https://github.com/UltronValour/mmi-platform.git
cd mmi-platform
```

### 2. Set up the backend
```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
python -m backend.app
```
Backend runs at `http://localhost:5000`

### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## 🌐 Deploying

**Backend → [Render](https://render.com)**
- Runtime: Python 3
- Start Command: `python -m backend.app`
- Build Command: `pip install -r requirements.txt`

**Frontend → [Vercel](https://vercel.com)**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL = https://your-render-url.onrender.com`

---

## ✨ Features

- 🎨 Premium dark-mode glassmorphism UI
- 📊 Live prediction history dashboard with CSV export
- 🔔 Non-intrusive toast notifications
- ⏳ Animated skeleton loaders during API calls
- 📱 Fully mobile responsive
- 🧪 One-click "Load Sample" for Parkinson's model
- 🗑️ Clear history with confirmation prompt
- 🔍 Movie search by title or genre with chip selector

---

## 📄 License

MIT — feel free to use, modify and distribute.
