import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../App.css";
import API_BASE from "../api";

const MODELS = [
    {
        id: "sentiment", icon: "💬", label: "Sentiment Analysis",
        desc: "Classify the emotional tone of any text as positive, negative, neutral, or irrelevant.",
        color: "#a78bfa", accentBg: "rgba(139,92,246,0.1)",
        accuracy: "94%", dataset: "Twitter Sentiment",
        tags: ["NLP", "Classification"],
    },
    {
        id: "fake-news", icon: "🔍", label: "Fake News Detection",
        desc: "Determine whether a news article is real or fabricated using NLP.",
        color: "#22d3ee", accentBg: "rgba(6,182,212,0.1)",
        accuracy: "91%", dataset: "LIAR / WELFake",
        tags: ["NLP", "Binary Classification"],
    },
    {
        id: "movie", icon: "🎬", label: "Movie Recommender",
        desc: "Get personalised movie suggestions based on a title or genre you love.",
        color: "#fbbf24", accentBg: "rgba(245,158,11,0.1)",
        accuracy: "Top-5", accuracyLabel: "rec.", dataset: "TMDB / MovieLens",
        tags: ["Recommendation", "Cosine Similarity"],
    },
    {
        id: "parkinsons", icon: "🧬", label: "Parkinson's Detection",
        desc: "Detect Parkinson's disease from 22 voice acoustic features using Random Forest.",
        color: "#f472b6", accentBg: "rgba(236,72,153,0.1)",
        accuracy: "95%", dataset: "UCI Parkinson's",
        tags: ["Healthcare", "Random Forest"],
    },
];

// ── Count-up animation hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    const rafRef = useRef(null);
    useEffect(() => {
        if (typeof target !== "number" || isNaN(target)) return;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);
    return value;
}

// ── Stat card with count-up ────────────────────────────────────────────────────
function StatCard({ rawValue, label, sub, prefix = "", suffix = "" }) {
    const numVal = typeof rawValue === "number" ? rawValue : parseFloat(rawValue);
    const animated = useCountUp(isNaN(numVal) ? 0 : numVal);
    const display = isNaN(numVal) ? rawValue : `${prefix}${animated}${suffix}`;

    return (
        <div style={{
            flex: 1, minWidth: 160, padding: "24px 28px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18,
        }}>
            <div style={{
                fontSize: "2.4rem", fontWeight: 800, color: "var(--text-primary)",
                letterSpacing: "-0.04em", lineHeight: 1,
            }}>{display}</div>
            <div style={{ fontSize: "0.92rem", color: "var(--text-secondary)", marginTop: 6, fontWeight: 500 }}>{label}</div>
            {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 3 }}>{sub}</div>}
        </div>
    );
}

// ── Model card ─────────────────────────────────────────────────────────────────
function ModelCard({ model, setPage }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setPage(model.id)}
            style={{
                flex: 1, minWidth: 220, minHeight: 220,
                padding: "28px 28px 24px",
                background: hovered ? model.accentBg : "rgba(255,255,255,0.03)",
                border: `1px solid ${hovered ? model.color + "40" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 20, cursor: "pointer",
                transition: "all 0.22s ease",
                transform: hovered ? "translateY(-4px)" : "none",
                boxShadow: hovered ? `0 16px 48px ${model.color}20` : "none",
                display: "flex", flexDirection: "column", gap: 14,
            }}
        >
            {/* Icon + metric badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{
                    width: 54, height: 54, borderRadius: 15, fontSize: 26,
                    background: model.accentBg, border: `1px solid ${model.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>{model.icon}</span>
                {model.accuracy !== "—" && (
                    <span style={{
                        fontSize: "0.75rem", fontWeight: 700,
                        color: model.color, background: model.accentBg,
                        padding: "4px 11px", borderRadius: 99,
                        border: `1px solid ${model.color}30`,
                    }}>{model.accuracy} {model.accuracyLabel ?? "acc."}</span>
                )}
            </div>

            {/* Label + desc */}
            <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                    {model.label}
                </div>
                <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {model.desc}
                </div>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {model.tags.map(t => (
                    <span key={t} style={{
                        fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)",
                        background: "rgba(255,255,255,0.05)", padding: "3px 10px",
                        borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
                    }}>{t}</span>
                ))}
            </div>

            {/* CTA */}
            <div style={{
                marginTop: "auto", fontSize: "0.83rem", fontWeight: 600,
                color: model.color, display: "flex", alignItems: "center", gap: 4,
            }}>
                Try it
                <span style={{
                    display: "inline-block",
                    transform: hovered ? "translateX(5px)" : "none",
                    transition: "transform 0.2s",
                }}>→</span>
            </div>
        </div>
    );
}

// ── Home page ──────────────────────────────────────────────────────────────────
function Home({ setPage }) {
    const [predCount, setPredCount] = useState(0);
    const [lastPred, setLastPred] = useState(null);
    const [online, setOnline] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE}/health`).then(() => setOnline(true)).catch(() => setOnline(false));
        axios.get(`${API_BASE}/history`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setPredCount(data.length);
                if (data.length > 0) setLastPred(data[0]);
            })
            .catch(() => { });
    }, []);

    const lastModel = MODELS.find(m => m.id === lastPred?.model_name) ?? null;

    return (
        <div className="home-wrapper" style={{ width: "100%", padding: "56px 48px 80px", boxSizing: "border-box" }}>

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <div style={{ textAlign: "center", marginBottom: 60 }}>
                {/* Status pill */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 16px", borderRadius: 99, marginBottom: 22,
                    background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)",
                    fontSize: "0.8rem", fontWeight: 600,
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: online ? "#4ade80" : "#f43f5e",
                        boxShadow: online ? "0 0 7px #4ade80" : "0 0 7px #f43f5e",
                        display: "inline-block",
                    }} />
                    <span style={{ color: online ? "#4ade80" : "#fb7185" }}>
                        {online ? "All Systems Online" : "Backend Offline"}
                    </span>
                </div>

                {/* Headline */}
                <h1 style={{
                    fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800,
                    letterSpacing: "-0.03em", lineHeight: 1.1,
                    background: "linear-gradient(135deg, #f1f5f9 0%, #a78bfa 50%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text", marginBottom: 18,
                }}>MMI <span style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 600, color: "var(--text-secondary)", WebkitTextFillColor: "var(--text-secondary)" }}><br />Multi-Model Interface</span></h1>

                {/* Subtext */}
                <p style={{
                    fontSize: "1.05rem", color: "var(--text-secondary)",
                    maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.7,
                }}>
                    A unified dashboard for four production-ready machine learning models spanning NLP, healthcare, and recommendation systems.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setShowPicker(true)} style={{
                        padding: "12px 30px", borderRadius: 12,
                        background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                        color: "#fff", border: "none", cursor: "pointer", fontWeight: 600,
                        fontSize: "0.95rem", boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(139,92,246,0.5)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.4)"; }}
                    >✨ Try a Model</button>
                    <button onClick={() => setPage("history")} style={{
                        padding: "12px 30px", borderRadius: 12,
                        background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)",
                        border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
                        fontWeight: 500, fontSize: "0.95rem", transition: "all 0.15s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >🕑 View History</button>
                </div>
            </div>

            {/* ── Model Picker Modal ─────────────────────────────────────────── */}
            {showPicker && (
                <div onClick={() => setShowPicker(false)} style={{
                    position: "fixed", inset: 0, zIndex: 200,
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "fadeUp 0.2s ease both",
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: "rgba(12,12,24,0.98)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 24, padding: "32px 32px 28px",
                        width: "min(560px, 90vw)",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15)",
                        animation: "resultReveal 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>Choose a Model</h2>
                            <button onClick={() => setShowPicker(false)} style={{
                                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 8, width: 30, height: 30, cursor: "pointer",
                                color: "var(--text-muted)", fontSize: "1rem", display: "flex",
                                alignItems: "center", justifyContent: "center",
                            }}>✕</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {MODELS.map(m => (
                                <button key={m.id} onClick={() => { setPage(m.id); setShowPicker(false); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 14,
                                        padding: "14px 16px", borderRadius: 14, width: "100%",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = `${m.color}12`; e.currentTarget.style.borderColor = `${m.color}35`; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                                >
                                    <span style={{
                                        width: 44, height: 44, borderRadius: 12, fontSize: 22, flexShrink: 0,
                                        background: m.accentBg, border: `1px solid ${m.color}25`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>{m.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{m.label}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{m.desc}</div>
                                    </div>
                                    <span style={{
                                        fontSize: "0.8rem", color: m.color, fontWeight: 700,
                                        padding: "3px 10px", borderRadius: 99, background: m.accentBg
                                    }}>
                                        {m.accuracy} {m.accuracyLabel ?? "acc."}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stats grid (2×2) ───────────────────────────────────────────── */}
            <div className="grid-2-cols" style={{ gap: 16, marginBottom: 20 }}>
                <StatCard rawValue={4} label="ML Models" sub="NLP · Healthcare · Recommendations" />
                <StatCard rawValue={predCount} label="Total Predictions" sub="Logged in database" />
                <StatCard rawValue={95} label="Best Accuracy" sub="Parkinson's Detection" suffix="%" />
                {/* Last Model Used — always shown */}
                <div style={{
                    padding: "24px 28px", background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${lastModel ? lastModel.color + "25" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 18,
                    background: lastModel ? lastModel.accentBg : "rgba(255,255,255,0.04)",
                }}>
                    {lastModel ? (
                        <>
                            <div style={{ fontSize: "2.4rem", lineHeight: 1, marginBottom: 6 }}>{lastModel.icon}</div>
                            <div style={{ fontSize: "0.92rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: 3 }}>Last Model Used</div>
                            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: lastModel.color }}>{lastModel.label}</div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: "2.4rem", lineHeight: 1, marginBottom: 6, opacity: 0.35 }}>🤖</div>
                            <div style={{ fontSize: "0.92rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: 3 }}>Last Model Used</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>No predictions yet</div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Divider ─────────────────────────────────────────────────────── */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "32px 0" }} />

            {/* ── Model cards ─────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    Available Models
                </h2>
                <span style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    Click any card to open
                </span>
            </div>
            <div className="grid-2-cols" style={{ gap: 20, marginTop: 16 }}>
                {MODELS.map(m => <ModelCard key={m.id} model={m} setPage={setPage} />)}
            </div>
        </div>
    );
}

export default Home;
