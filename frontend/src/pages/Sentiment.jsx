import { useState } from "react";
import axios from "axios";
import "../App.css";
import API_BASE from "../api";

function Sentiment({ showToast }) {
    const [text, setText] = useState("");
    const [result, setResult] = useState(null);
    const [analyzedText, setAnalyzedText] = useState("");   // echoed text
    const [loading, setLoading] = useState(false);

    const analyzeSentiment = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const response = await axios.post(
                `${API_BASE}/predict/sentiment`,
                { text }
            );
            setResult(response.data);
            setAnalyzedText(text);          // save snapshot of what was sent
        } catch (err) {
            showToast("Failed to connect to the server. Make sure the backend is running.", "error");
            console.error(err);
        }

        setLoading(false);
    };

    const clear = () => { setText(""); setResult(null); setAnalyzedText(""); };

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === "Enter") analyzeSentiment();
    };

    const labelMap = {
        positive: { label: "Positive 😊", color: "#4ade80", bg: "rgba(34,197,94,0.18)", border: "rgba(34,197,94,0.35)" },
        negative: { label: "Negative 😞", color: "#fb7185", bg: "rgba(244,63,94,0.18)", border: "rgba(244,63,94,0.35)" },
        neutral: { label: "Neutral 😐", color: "#fbbf24", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.35)" },
        irrelevant: { label: "Irrelevant", color: "#94a3b8", bg: "rgba(100,116,139,0.18)", border: "rgba(100,116,139,0.35)" },
    };

    const pred = result?.prediction?.toLowerCase();
    const meta = labelMap[pred];

    return (
        <div className="page-wrapper">
            <div className="card">
                <div className="page-header">
                    <div className="page-icon violet">💬</div>
                    <div>
                        <h1>Sentiment Analysis</h1>
                        <p>Classify the emotional tone of any text — positive, negative, neutral, or irrelevant</p>
                    </div>
                </div>

                <div className="field-label">Input Text</div>
                <textarea
                    className="textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or paste text here… (Ctrl+Enter to analyze)"
                />

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button
                        className="btn-primary"
                        onClick={analyzeSentiment}
                        disabled={loading || !text.trim()}
                        style={{ flex: 1 }}
                    >
                        {loading ? <><span className="spinner" /> Analyzing…</> : <><span>✨</span> Analyze Sentiment</>}
                    </button>
                    {(result || text) && (
                        <button
                            onClick={clear}
                            style={{
                                padding: "0 22px", borderRadius: "var(--radius-md)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.05)",
                                color: "var(--text-muted)", cursor: "pointer",
                                fontSize: "0.88rem", fontWeight: 500, transition: "all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                        >✕ Clear</button>
                    )}
                </div>

                {loading && (
                    <div className="result-box skeleton-box" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                        <div className="skeleton-text" style={{ width: "30%", height: 16, marginBottom: 16 }} />
                        <div className="skeleton-text" style={{ width: "40%", height: 32, marginBottom: 20, borderRadius: 99 }} />
                        <div className="skeleton-text" style={{ height: "4em", marginBottom: 20 }} />
                        <div className="skeleton-text" style={{ width: "100%", height: 8, borderRadius: 99 }} />
                    </div>
                )}

                {!loading && result && meta && (
                    <div className="result-box" style={{ borderColor: meta.border?.replace("0.35", "0.25") }}>
                        <h3>Analysis Result</h3>

                        {/* Badge */}
                        <span className="badge" style={{
                            background: meta.bg, color: meta.color,
                            border: `1px solid ${meta.border}`,
                            fontSize: "1rem", padding: "6px 20px",
                        }}>
                            {meta.label}
                        </span>

                        {/* Echoed text */}
                        {analyzedText && (
                            <div style={{
                                marginTop: 14, padding: "10px 14px", borderRadius: 10,
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                                fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6,
                                maxHeight: 80, overflowY: "auto",
                            }}>
                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Analyzed text</span>
                                "{analyzedText}"
                            </div>
                        )}

                        {/* Confidence */}
                        {result.confidence != null && (
                            <>
                                <div className="confidence-row" style={{ marginTop: 14 }}>
                                    <span>Confidence Score</span>
                                    <span className="confidence-value">{(result.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${result.confidence * 100}%`,
                                            background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`,
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sentiment;