import { useState } from "react";
import axios from "axios";
import "../App.css";
import API_BASE from "../api";

const FAKE_INDICATORS = [
    "Sensational language", "No credible sources cited",
    "Emotionally charged wording", "Unverified claims",
];
const REAL_INDICATORS = [
    "Formal journalistic tone", "Factual, verifiable content",
    "Balanced perspective", "Credible structure",
];

export default function FakeNews({ showToast }) {
    const [text, setText] = useState("");
    const [result, setResult] = useState(null);
    const [analyzedText, setAnalyzedText] = useState("");
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const response = await axios.post(
                `${API_BASE}/predict/fake-news`,
                { text }
            );
            setResult(response.data);
            setAnalyzedText(text);
        } catch (err) {
            showToast("Failed to connect to the server. Make sure the backend is running.", "error");
            console.error(err);
        }
        setLoading(false);
    };

    const clear = () => { setText(""); setResult(null); setAnalyzedText(""); };

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === "Enter") analyze();
    };

    const predLabel = result?.prediction?.toLowerCase();
    const isFake = predLabel === "fake";

    return (
        <div className="page-wrapper">
            <div className="card">
                <div className="page-header">
                    <div className="page-icon cyan">🔍</div>
                    <div>
                        <h1>Fake News Detection</h1>
                        <p>Verify the authenticity of news articles using NLP</p>
                    </div>
                </div>

                <div className="field-label">Article Text</div>
                <textarea
                    className="textarea"
                    rows={7}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste a news article or headline here… (Ctrl+Enter to check)"
                />

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button
                        className="btn-primary"
                        onClick={analyze}
                        disabled={loading || !text.trim()}
                        style={{
                            flex: 1,
                            background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                            boxShadow: "0 4px 18px rgba(6,182,212,0.3)",
                        }}
                    >
                        {loading ? <><span className="spinner" /> Checking…</> : <><span>🔎</span> Check News</>}
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
                        <div className="skeleton-text" style={{ height: "3em", marginBottom: 20 }} />
                        <div className="skeleton-text" style={{ height: "4em", marginBottom: 20 }} />
                        <div className="skeleton-text" style={{ width: "100%", height: 8, borderRadius: 99 }} />
                    </div>
                )}

                {!loading && result && (
                    <div className="result-box" style={{
                        borderColor: isFake ? "rgba(244,63,94,0.3)" : "rgba(34,197,94,0.3)",
                    }}>
                        <h3>Detection Result</h3>

                        {/* Badge */}
                        <span className={`badge ${predLabel}`} style={{ fontSize: "1rem", padding: "6px 20px" }}>
                            {isFake ? "🚨 Fake News" : "✅ Real News"}
                        </span>

                        {/* Echoed text snippet */}
                        {analyzedText && (
                            <div style={{
                                marginTop: 14, padding: "10px 14px", borderRadius: 10,
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                                fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6,
                                maxHeight: 72, overflowY: "auto",
                            }}>
                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 4 }}>Analyzed text</span>
                                "{analyzedText.length > 200 ? analyzedText.slice(0, 200) + "…" : analyzedText}"
                            </div>
                        )}

                        {/* What this means */}
                        <div style={{
                            marginTop: 14, padding: "12px 14px", borderRadius: 12,
                            background: isFake ? "rgba(244,63,94,0.07)" : "rgba(34,197,94,0.07)",
                            border: `1px solid ${isFake ? "rgba(244,63,94,0.2)" : "rgba(34,197,94,0.2)"}`,
                        }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: isFake ? "#fb7185" : "#4ade80", marginBottom: 8 }}>
                                {isFake ? "Detected indicators" : "Credibility signals"}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {(isFake ? FAKE_INDICATORS : REAL_INDICATORS).map(ind => (
                                    <span key={ind} style={{
                                        fontSize: "0.78rem", padding: "3px 10px", borderRadius: 99,
                                        background: isFake ? "rgba(244,63,94,0.12)" : "rgba(34,197,94,0.12)",
                                        color: isFake ? "#fb7185" : "#4ade80",
                                        border: `1px solid ${isFake ? "rgba(244,63,94,0.25)" : "rgba(34,197,94,0.25)"}`,
                                    }}>{ind}</span>
                                ))}
                            </div>
                        </div>

                        {/* Confidence bar */}
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
                                            background: isFake
                                                ? "linear-gradient(90deg,#f43f5e,#fb7185)"
                                                : "linear-gradient(90deg,#22c55e,#4ade80)",
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