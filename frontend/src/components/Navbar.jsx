import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../App.css";
import API_BASE from "../api";

const MODELS = [
    { id: "sentiment", label: "Sentiment Analysis", icon: "💬", desc: "Classify emotional tone of text", color: "#a78bfa" },
    { id: "fake-news", label: "Fake News Detection", icon: "🔍", desc: "Detect real vs fake news articles", color: "#22d3ee" },
    { id: "movie", label: "Movie Recommender", icon: "🎬", desc: "Get personalised film suggestions", color: "#fbbf24" },
    { id: "parkinsons", label: "Parkinson's Detection", icon: "🧬", desc: "Analyse voice features for diagnosis", color: "#f472b6" },
];

function Navbar({ page, setPage }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [historyCount, setHistoryCount] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        axios.get(`${API_BASE}/history`)
            .then(res => setHistoryCount(Array.isArray(res.data) ? res.data.length : 0))
            .catch(() => setHistoryCount(null));
    }, [page]); // refresh count when page changes

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isModelActive = MODELS.some(m => m.id === page);

    return (
        <header style={{
            position: "sticky", top: 0, zIndex: 100,
            background: "rgba(10,10,20,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
            <nav style={{
                width: "100%", padding: "0 48px", height: 90,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxSizing: "border-box",
            }}>
                {/* Brand */}
                <button onClick={() => setPage("home")} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>
                    <span style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, boxShadow: "0 0 18px rgba(139,92,246,0.45)",
                    }}>🧠</span>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                        MMI
                    </span>
                </button>

                {/* Nav */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {/* Home */}
                    <NavBtn active={page === "home"} onClick={() => setPage("home")}>🏠 Home</NavBtn>

                    {/* Models dropdown */}
                    <div ref={dropdownRef} style={{ position: "relative" }}>
                        <NavBtn
                            active={isModelActive}
                            onClick={() => setDropdownOpen(o => !o)}
                        >
                            🤖 Models&nbsp;
                            <span style={{
                                fontSize: "0.7rem",
                                display: "inline-block",
                                transform: dropdownOpen ? "rotate(180deg)" : "none",
                                transition: "transform 0.2s",
                            }}>▾</span>
                        </NavBtn>

                        {dropdownOpen && (
                            <div style={{
                                position: "absolute", top: "calc(100% + 8px)", right: 0,
                                minWidth: 240,
                                background: "rgba(15,15,28,0.97)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 14,
                                padding: "6px",
                                boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
                                backdropFilter: "blur(24px)",
                                animation: "fadeUp 0.18s ease both",
                            }}>
                                {MODELS.map(m => (
                                    <button key={m.id} onClick={() => { setPage(m.id); setDropdownOpen(false); }}
                                        style={{
                                            display: "flex", alignItems: "flex-start", gap: 10,
                                            width: "100%", padding: "10px 12px", borderRadius: 10,
                                            background: page === m.id ? `${m.color}14` : "transparent",
                                            border: "none", cursor: "pointer",
                                            transition: "background 0.15s",
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                                        onMouseLeave={e => e.currentTarget.style.background = page === m.id ? `${m.color}14` : "transparent"}
                                    >
                                        <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>{m.icon}</span>
                                        <div>
                                            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{m.label}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* History with badge */}
                    <NavBtn active={page === "history"} onClick={() => setPage("history")}>
                        🕑 History
                        {historyCount !== null && (
                            <span style={{
                                marginLeft: 5, fontSize: "0.65rem", fontWeight: 700,
                                background: "rgba(139,92,246,0.25)", color: "#a78bfa",
                                padding: "1px 6px", borderRadius: 99, lineHeight: "1.5",
                            }}>{historyCount}</span>
                        )}
                    </NavBtn>
                </div>
            </nav>
        </header>
    );
}

function NavBtn({ active, onClick, children }) {
    return (
        <button onClick={onClick} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 10,
            border: "1px solid",
            borderColor: active ? "rgba(139,92,246,0.5)" : "transparent",
            background: active ? "rgba(139,92,246,0.15)" : "transparent",
            color: active ? "var(--text-primary)" : "var(--text-secondary)",
            fontSize: "0.92rem", fontWeight: active ? 600 : 400,
            cursor: "pointer", transition: "all 0.18s ease",
            whiteSpace: "nowrap",
        }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
        >
            {children}
        </button>
    );
}

export default Navbar;