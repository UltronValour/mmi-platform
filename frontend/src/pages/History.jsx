import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import API_BASE from "../api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseMovieTitles(predictionStr) {
    try {
        const arr = JSON.parse(predictionStr);
        if (Array.isArray(arr)) return arr.map(m => m.title).filter(Boolean);
    } catch { /* not JSON */ }
    return null;
}

function tryParseJSON(str) {
    try { return JSON.parse(str); } catch { return null; }
}

// Extract plain text from inputs stored as "{'text': '...'}" or JSON {"text":"..."}
function extractText(input_data) {
    if (!input_data) return "";
    // Try JSON parse first
    const j = tryParseJSON(input_data);
    if (j && j.text) return j.text;
    // Try Python dict repr: {'text': '...'}
    const m = input_data.match(/['"]text['"]:?\s*['"]([\s\S]+?)['"]\s*}/);
    if (m) return m[1];
    // Fallback: return as-is
    return input_data;
}

function formatTime(ts) {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return ts; }
}

// ─── Per-model config ─────────────────────────────────────────────────────────
const MODEL_META = {
    sentiment: { label: "Sentiment", icon: "💬", color: "#a78bfa", bg: "rgba(139,92,246,0.15)" },
    "fake-news": { label: "Fake News", icon: "🔍", color: "#22d3ee", bg: "rgba(6,182,212,0.15)" },
    "fake_news": { label: "Fake News", icon: "🔍", color: "#22d3ee", bg: "rgba(6,182,212,0.15)" },
    movie: { label: "Movie", icon: "🎬", color: "#fbbf24", bg: "rgba(245,158,11,0.15)" },
    movie_genre: { label: "By Genre", icon: "🎬", color: "#fbbf24", bg: "rgba(245,158,11,0.15)" },
    parkinsons: { label: "Parkinson's", icon: "🧬", color: "#f472b6", bg: "rgba(236,72,153,0.15)" },
};

// ─── Prediction badge per model ───────────────────────────────────────────────
function PredBadge({ item }) {
    const pred = item.prediction?.toLowerCase();
    const conf = item.confidence != null && !isNaN(item.confidence)
        ? (item.confidence * 100).toFixed(0) + "%" : null;

    const presets = {
        positive: { bg: "rgba(34,197,94,0.18)", color: "#4ade80", border: "rgba(34,197,94,0.35)", label: "😊 Positive" },
        negative: { bg: "rgba(244,63,94,0.18)", color: "#fb7185", border: "rgba(244,63,94,0.35)", label: "😞 Negative" },
        neutral: { bg: "rgba(245,158,11,0.18)", color: "#fbbf24", border: "rgba(245,158,11,0.35)", label: "😐 Neutral" },
        irrelevant: { bg: "rgba(100,116,139,0.18)", color: "#94a3b8", border: "rgba(100,116,139,0.35)", label: "— Irrelevant" },
        real: { bg: "rgba(34,197,94,0.18)", color: "#4ade80", border: "rgba(34,197,94,0.35)", label: "✅ Real" },
        fake: { bg: "rgba(244,63,94,0.18)", color: "#fb7185", border: "rgba(244,63,94,0.35)", label: "🚫 Fake" },
        parkinsons: { bg: "rgba(244,63,94,0.18)", color: "#fb7185", border: "rgba(244,63,94,0.35)", label: "🔴 Detected" },
        healthy: { bg: "rgba(34,197,94,0.18)", color: "#4ade80", border: "rgba(34,197,94,0.35)", label: "🟢 Not Detected" },
    };

    const p = presets[pred] ?? { bg: "rgba(139,92,246,0.18)", color: "#a78bfa", border: "rgba(139,92,246,0.35)", label: pred ?? "—" };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{
                fontSize: "0.85rem", fontWeight: 700, padding: "6px 12px", borderRadius: 8,
                background: p.bg, color: p.color, border: `1px solid ${p.border}`,
                whiteSpace: "nowrap",
            }}>{p.label}</span>
            {conf && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{conf}</span>}
        </div>
    );
}

// ─── Expanded detail panels ───────────────────────────────────────────────────
function ExpandedPanel({ item, meta }) {
    const modelName = item.model_name;
    const isMovie = modelName === "movie" || modelName === "movie_genre";
    const isParkinsons = modelName === "parkinsons";

    // Confidence bar
    const conf = item.confidence != null && !isNaN(item.confidence) ? item.confidence : null;

    const SectionLabel = ({ children }) => (
        <div style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
            {children}
        </div>
    );

    // Movie: numbered titles
    if (isMovie) {
        const titles = parseMovieTitles(item.prediction);
        if (!titles) return null;
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <SectionLabel>Recommendations</SectionLabel>
                {titles.map((title, idx) => (
                    <div key={idx} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: 10,
                        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.14)",
                    }}>
                        <span style={{
                            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                            background: "rgba(245,158,11,0.18)", color: "#fbbf24",
                            fontWeight: 700, fontSize: "0.85rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{idx + 1}</span>
                        <span style={{ fontSize: "0.98rem", color: "var(--text-primary)", fontWeight: 500 }}>{title}</span>
                    </div>
                ))}
            </div>
        );
    }

    // Parkinson's: parse JSON input and show key features
    if (isParkinsons) {
        const features = tryParseJSON(item.input_data) ?? {};
        const TOP_FEATURES = ["PPE", "RPDE", "DFA", "spread1", "spread2", "HNR", "NHR"];
        const FEATURE_TOOLTIPS = {
            "PPE": "Pitch Period Entropy (Nonlinear measure of fundamental frequency variation)",
            "RPDE": "Recurrence Period Density Entropy (Nonlinear complexity measure)",
            "DFA": "Detrended Fluctuation Analysis (Signal fractal scaling exponent)",
            "spread1": "Nonlinear measure of fundamental frequency variation",
            "spread2": "Nonlinear measure of fundamental frequency variation",
            "HNR": "Harmonics-to-Noise Ratio",
            "NHR": "Noise-to-Harmonics Ratio"
        };

        const hasFeatures = Object.keys(features).length > 0;
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {hasFeatures && (
                    <>
                        <SectionLabel>Key Voice Features</SectionLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                            {TOP_FEATURES.filter(f => features[f] !== undefined).map(f => (
                                <div key={f} style={{
                                    padding: "8px 12px", borderRadius: 10,
                                    background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.14)",
                                }} title={FEATURE_TOOLTIPS[f]}>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, borderBottom: "1px dotted #a1a1aa", width: "max-content", cursor: "help" }}>{f}</div>
                                    <div style={{ fontSize: "1rem", color: "#f472b6", fontWeight: 700 }}>
                                        {typeof features[f] === "number" ? features[f].toFixed(4) : features[f]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {conf !== null && (
                    <>
                        <SectionLabel>Confidence</SectionLabel>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{
                                height: "100%", borderRadius: 99, width: `${conf * 100}%`,
                                background: item.prediction === "parkinsons"
                                    ? "linear-gradient(90deg,#f43f5e,#fb7185)"
                                    : "linear-gradient(90deg,#22c55e,#4ade80)",
                                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                            }} />
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Sentiment & Fake News: full text + confidence bar
    const textContent = extractText(item.input_data);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {textContent && (
                <>
                    <SectionLabel>Input Text</SectionLabel>
                    <div style={{
                        padding: "16px 18px", borderRadius: 10, fontSize: "1rem",
                        background: `${meta.color.replace("0.15", "0.06")}`,
                        border: `1px solid ${meta.text}22`,
                        color: "var(--text-primary)", lineHeight: 1.6,
                        maxHeight: 120, overflowY: "auto",
                    }}>{textContent}</div>
                </>
            )}
            {conf !== null && (
                <>
                    <SectionLabel>Confidence — {(conf * 100).toFixed(1)}%</SectionLabel>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", borderRadius: 99, width: `${conf * 100}%`,
                            background: `linear-gradient(90deg, ${meta.text}, ${meta.color.replace("0.15)", "0.9)")})`,
                            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                        }} />
                    </div>
                </>
            )}
        </div>
    );
}

// ─── History Item ─────────────────────────────────────────────────────────────
function HistoryItem({ item }) {
    const [expanded, setExpanded] = useState(false);
    const meta = MODEL_META[item.model_name] ?? {
        label: item.model_name ?? "—", icon: "⚙️",
        color: "rgba(139,92,246,0.15)", text: "#a78bfa", bg: "rgba(139,92,246,0.12)",
    };

    const isMovie = item.model_name === "movie" || item.model_name === "movie_genre";
    const movieTitles = isMovie ? parseMovieTitles(item.prediction) : null;

    // Short summary text shown in the collapsed row
    const summaryText = () => {
        if (isMovie) return item.input_data ?? "—";
        if (item.model_name === "parkinsons") return "Voice feature analysis · 22 parameters";
        const txt = extractText(item.input_data);
        return txt.length > 80 ? txt.slice(0, 80) + "…" : txt;
    };

    return (
        <div
            onClick={() => setExpanded(e => !e)}
            style={{
                padding: "14px 18px", borderRadius: 14,
                background: expanded ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.18)",
                border: `1px solid ${expanded ? meta.text + "35" : "var(--border-glass)"}`,
                transition: "all 0.2s ease", cursor: "pointer",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = meta.text + "35";
            }}
            onMouseLeave={e => {
                if (!expanded) {
                    e.currentTarget.style.background = "rgba(0,0,0,0.18)";
                    e.currentTarget.style.borderColor = "var(--border-glass)";
                }
            }}
        >
            {/* Collapsed row */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: "0 12px", alignItems: "center" }}>
                {/* Model chip */}
                <span style={{
                    fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: meta.text,
                    padding: "4px 10px", background: meta.bg ?? meta.color, borderRadius: 7,
                    whiteSpace: "nowrap",
                }}>{meta.icon} {meta.label}</span>

                {/* Summary */}
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: "0.98rem", fontWeight: 500, color: "var(--text-primary)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2,
                    }}>{summaryText()}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{formatTime(item.timestamp)}</div>
                </div>

                {/* Badge */}
                {isMovie ? (
                    <span style={{ fontSize: "0.85rem", color: meta.text, whiteSpace: "nowrap" }}>
                        {movieTitles ? `${movieTitles.length} films` : "view"}
                    </span>
                ) : (
                    <PredBadge item={item} />
                )}

                {/* Chevron */}
                <span style={{
                    fontSize: "0.9rem", color: "var(--text-muted)", flexShrink: 0,
                    transform: expanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                }}>▾</span>
            </div>

            {/* Expanded panel */}
            {expanded && (
                <div style={{
                    marginTop: 14, paddingTop: 14,
                    borderTop: `1px solid ${meta.text}20`,
                    animation: "fadeUp 0.18s ease both",
                }}>
                    <ExpandedPanel item={item} meta={meta} />
                </div>
            )}
        </div>
    );
}

// ─── History Page ─────────────────────────────────────────────────────────────
function History({ showToast }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/history`);
            setHistory(Array.isArray(res.data) ? res.data : [res.data]);
        } catch {
            showToast("Could not load history. Make sure the backend is running.", "error");
        }
        setLoading(false);
    };

    const clearHistory = async () => {
        if (!window.confirm("Are you sure you want to delete all prediction history? This cannot be undone.")) return;
        setLoading(true);
        try {
            await axios.delete(`${API_BASE}/history`);
            setHistory([]);
            showToast("History cleared successfully.", "success");
        } catch {
            showToast("Failed to clear history.", "error");
        }
        setLoading(false);
    };

    const exportCSV = () => {
        if (history.length === 0) return;
        const headers = ["ID", "Timestamp", "Model", "Input Data", "Prediction", "Confidence"];
        const rows = history.map(item => [
            item.id,
            item.timestamp,
            item.model_name,
            `"${String(item.input_data ?? "").replace(/"/g, '""')}"`,
            `"${String(item.prediction ?? "").replace(/"/g, '""')}"`,
            item.confidence != null ? item.confidence.toFixed(4) : ""
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `mmi_history_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Exported history to CSV.");
    };

    useEffect(() => { fetchHistory(); }, []);

    return (
        <div className="page-wrapper">
            <div className="card">
                <div className="page-header" style={{ marginBottom: 8 }}>
                    <div className="page-icon emerald">🕑</div>
                    <div>
                        <h1>Prediction History</h1>
                        <p>All past model predictions — click any entry to expand details</p>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 20 }}>
                    {history.length > 0 && (
                        <>
                            <button className="btn-secondary" onClick={exportCSV} disabled={loading}>
                                📥 Export CSV
                            </button>
                            <button className="btn-secondary" onClick={clearHistory} disabled={loading} style={{
                                color: "#fb7185", borderColor: "rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.05)"
                            }}>
                                {loading ? "..." : "🗑️ Clear History"}
                            </button>
                        </>
                    )}
                    <button className="btn-secondary" onClick={fetchHistory} disabled={loading}>
                        {loading ? <><span className="spinner" /> Refreshing…</> : <>↻ Refresh</>}
                    </button>
                </div>

                {!loading && history.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No predictions yet. Run an analysis to see results here.</p>
                    </div>
                )}

                {history.length > 0 && (
                    <div className="history-list">
                        {history.map((item, i) => (
                            <HistoryItem key={item.id ?? i} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;