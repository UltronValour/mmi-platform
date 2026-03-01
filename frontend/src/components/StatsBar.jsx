import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../api";

const MODELS = [
    { id: "sentiment", label: "Sentiment", icon: "💬", color: "#a78bfa" },
    { id: "fake-news", label: "Fake News", icon: "🔍", color: "#22d3ee" },
    { id: "movie", label: "Movies", icon: "🎬", color: "#fbbf24" },
    { id: "parkinsons", label: "Parkinson's", icon: "🧬", color: "#f472b6" },
];

function StatsBar() {
    const [predictionCount, setPredictionCount] = useState(null);
    const [online, setOnline] = useState(false);

    useEffect(() => {
        // Check backend status and get prediction count
        axios.get(`${API_BASE}/health`)
            .then(() => setOnline(true))
            .catch(() => setOnline(false));

        axios.get(`${API_BASE}/history`)
            .then(res => {
                const data = res.data;
                setPredictionCount(Array.isArray(data) ? data.length : 0);
            })
            .catch(() => setPredictionCount("—"));
    }, []);

    return (
        <div style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(12px)",
        }}>
            <div style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
            }}>
                {/* Status pill */}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{
                        width: 7, height: 7,
                        borderRadius: "50%",
                        background: online ? "#4ade80" : "#f43f5e",
                        boxShadow: online
                            ? "0 0 6px rgba(74,222,128,0.7)"
                            : "0 0 6px rgba(244,63,94,0.7)",
                        display: "inline-block",
                    }} />
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                        {online ? "Backend Online" : "Backend Offline"}
                    </span>
                </div>

                <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />

                {/* Model chips */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Models
                    </span>
                    {MODELS.map(m => (
                        <span key={m.id} style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "2px 9px",
                            borderRadius: 6,
                            background: `${m.color}18`,
                            color: m.color,
                            border: `1px solid ${m.color}30`,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}>
                            {m.icon} {m.label}
                        </span>
                    ))}
                </div>

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Predictions</span>
                    <span style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#a78bfa",
                        minWidth: 24,
                        textAlign: "right",
                    }}>
                        {predictionCount ?? "…"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StatsBar;
