import "../App.css";

const MODEL_LABELS = {
    sentiment: { label: "Sentiment Analysis", icon: "💬" },
    "fake-news": { label: "Fake News Detection", icon: "🔍" },
    "fake_news": { label: "Fake News Detection", icon: "🔍" },
    movie: { label: "Movie Recommender", icon: "🎬" },
    movie_genre: { label: "Movie Recommender", icon: "🎬" },
    parkinsons: { label: "Parkinson's Detection", icon: "🧬" },
};

const PAGE_LABELS = {
    sentiment: "Sentiment Analysis",
    "fake-news": "Fake News Detection",
    movie: "Movie Recommender",
    parkinsons: "Parkinson's Detection",
    history: "Prediction History",
};

function Breadcrumb({ page, setPage }) {
    const label = PAGE_LABELS[page];
    if (!label) return null;

    const isModel = page !== "history";

    return (
        <div style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.15)",
            padding: "0 48px",
        }}>
            <div style={{
                height: 52, display: "flex", alignItems: "center", gap: 8,
                fontSize: "0.92rem", color: "var(--text-muted)",
            }}>
                <button onClick={() => setPage("home")} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", fontSize: "0.92rem", padding: 0,
                    transition: "color 0.15s",
                }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                >🏠 Home</button>
                <span>›</span>
                {isModel && (
                    <>
                        <span style={{ color: "var(--text-muted)" }}>Models</span>
                        <span>›</span>
                    </>
                )}
                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
            </div>
        </div>
    );
}

export default Breadcrumb;
