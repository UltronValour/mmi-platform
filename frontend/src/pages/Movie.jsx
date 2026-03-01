import { useState } from "react";
import axios from "axios";
import "../App.css";
import API_BASE from "../api";

const GENRE_SUGGESTIONS = [
    "action", "adventure", "animation", "comedy", "crime",
    "drama", "fantasy", "horror", "mystery", "romance",
    "science_fiction", "thriller", "war", "western",
];

export default function Movie({ showToast }) {
    const [mode, setMode] = useState("title"); // "title" | "genre"
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const search = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setResults(null);

        try {
            const body = mode === "title" ? { title: query } : { genre: query };
            const endpoint = mode === "title"
                ? `${API_BASE}/predict/movie`
                : `${API_BASE}/predict/movie`;

            const response = await axios.post(endpoint, body);
            setResults(response.data);
        } catch (err) {
            const serverMsg = err?.response?.data?.error;
            if (serverMsg) {
                showToast(serverMsg, "error");
            } else if (err?.code === "ERR_NETWORK" || err?.code === "ECONNREFUSED") {
                showToast("Cannot reach the backend. Make sure the Flask server is running.", "error");
            } else {
                showToast("Something went wrong. Please try again.", "error");
            }
            console.error(err);
        }

        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") search();
    };

    const recommendations = results?.recommendations ?? [];

    return (
        <div className="page-wrapper">
            <div className="card">
                {/* Header */}
                <div className="page-header">
                    <div className="page-icon" style={{
                        background: "rgba(245, 158, 11, 0.2)",
                        width: 46, height: 46, borderRadius: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, flexShrink: 0,
                    }}>🎬</div>
                    <div>
                        <h1>Movie Recommender</h1>
                        <p>Find similar movies using content-based filtering</p>
                    </div>
                </div>

                {/* Mode toggle */}
                <div style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 24,
                    background: "rgba(0,0,0,0.2)",
                    padding: 4,
                    borderRadius: "var(--radius-md)",
                    width: "fit-content",
                }}>
                    {[
                        { key: "title", label: "🔎 By Title" },
                        { key: "genre", label: "🎭 By Genre" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => { setMode(key); setQuery(""); setResults(null); }}
                            style={{
                                padding: "7px 18px",
                                borderRadius: 10,
                                border: "none",
                                background: mode === key
                                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                    : "transparent",
                                color: mode === key ? "#fff" : "var(--text-secondary)",
                                fontWeight: mode === key ? 600 : 400,
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                transition: "all 0.18s ease",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="field-label">
                    {mode === "title" ? "Movie Title" : "Genre"}
                </div>

                {mode === "title" ? (
                    <input
                        type="text"
                        className="textarea"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='e.g. "The Godfather", "Inception", "Interstellar"…'
                        style={{ height: "auto", padding: "13px 16px" }}
                    />
                ) : (
                    <>
                        <input
                            type="text"
                            className="textarea"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder='e.g. "drama", "thriller", "science_fiction"…'
                            style={{ height: "auto", padding: "13px 16px" }}
                        />
                        {/* Genre chips */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                            {GENRE_SUGGESTIONS.map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setQuery(g)}
                                    style={{
                                        padding: "4px 12px",
                                        borderRadius: 99,
                                        border: `1px solid ${query === g ? "rgba(245,158,11,0.5)" : "var(--border-glass)"}`,
                                        background: query === g ? "rgba(245,158,11,0.15)" : "transparent",
                                        color: query === g ? "#fbbf24" : "var(--text-secondary)",
                                        fontSize: "0.78rem",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {g.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <button
                    className="btn-primary"
                    onClick={search}
                    disabled={loading || !query.trim()}
                    style={{
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        boxShadow: "0 4px 18px rgba(245,158,11,0.35)",
                    }}
                >
                    {loading
                        ? <><span className="spinner" /> Searching…</>
                        : <><span>🎬</span> Get Recommendations</>
                    }
                </button>

                {/* Results */}
                {results && (
                    <div className="result-box">
                        <h3>
                            {mode === "title"
                                ? `Recommendations for "${results.input ?? query}"`
                                : `Top "${query.replace("_", " ")}" Movies`}
                        </h3>

                        {recommendations.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🎞️</div>
                                <p>No results found. Try a different title or genre.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                                {recommendations.map((movie, i) => (
                                    <MovieCard key={i} rank={i + 1} movie={movie} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}

function MovieCard({ rank, movie }) {
    const genres = Array.isArray(movie.genres)
        ? movie.genres
        : typeof movie.genres === "string"
            ? movie.genres.replace(/[\[\]']/g, "").split(",").map(g => g.trim())
            : [];

    const similarity = movie.similarity != null
        ? `${(movie.similarity * 100).toFixed(0)}% match`
        : null;

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr auto",
            gap: "0 14px",
            padding: "16px 18px",
            borderRadius: "var(--radius-md)",
            background: "rgba(0,0,0,0.18)",
            border: "1px solid var(--border-glass)",
            alignItems: "start",
            transition: "border-color 0.18s, background 0.18s",
        }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(0,0,0,0.18)";
                e.currentTarget.style.borderColor = "var(--border-glass)";
            }}
        >
            {/* Rank */}
            <span style={{
                width: 32, height: 32,
                borderRadius: 10,
                background: "rgba(245,158,11,0.15)",
                color: "#fbbf24",
                fontWeight: 700,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                {rank}
            </span>

            {/* Content */}
            <div style={{ minWidth: 0 }}>
                <div style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--text-primary)",
                    marginBottom: 5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                    {movie.title}
                    {movie.year && (
                        <span style={{ marginLeft: 8, color: "var(--text-muted)", fontWeight: 400, fontSize: "0.82rem" }}>
                            {movie.year}
                        </span>
                    )}
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                        {genres.slice(0, 4).map((g, i) => (
                            <span key={i} style={{
                                padding: "2px 8px",
                                borderRadius: 99,
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                background: "rgba(139,92,246,0.12)",
                                color: "#a78bfa",
                                border: "1px solid rgba(139,92,246,0.2)",
                            }}>
                                {g.replace("_", " ")}
                            </span>
                        ))}
                    </div>
                )}

                {/* Overview preview */}
                {movie.overview && (
                    <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.55,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {movie.overview}
                    </p>
                )}
            </div>

            {/* Right col */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                {movie.vote_average != null && (
                    <span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: "#fbbf24",
                    }}>
                        ⭐ {Number(movie.vote_average).toFixed(1)}
                    </span>
                )}
                {similarity && (
                    <span style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                    }}>
                        {similarity}
                    </span>
                )}
            </div>
        </div>
    );
}
