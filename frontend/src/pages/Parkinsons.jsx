import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";

const API = API_BASE;

function Parkinsons({ showToast }) {
    const [features, setFeatures] = useState([]);
    const [form, setForm] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingFeatures, setLoadingFeatures] = useState(true);

    // Fetch feature names from backend
    useEffect(() => {
        axios.get(`${API}/parkinsons/features`)
            .then(res => {
                const names = res.data.features;
                setFeatures(names);
                // Pre-fill all fields with empty string
                const blank = {};
                names.forEach(f => (blank[f] = ""));
                setForm(blank);
            })
            .catch(() => showToast("Could not load feature list from server.", "error"))
            .finally(() => setLoadingFeatures(false));
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const allFilled = features.length > 0 && features.every(f => form[f] !== "");

    const predict = async () => {
        setLoading(true);
        setResult(null);

        // Convert all values to numbers
        const payload = {};
        features.forEach(f => (payload[f] = parseFloat(form[f])));

        try {
            const res = await axios.post(`${API}/predict/parkinsons`, payload);
            setResult(res.data);
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to connect to the server.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fillSample = () => {
        const SAMPLES = [
            { // Parkinson's
                "MDVP:Fo(Hz)": 119.992, "MDVP:Fhi(Hz)": 157.302, "MDVP:Flo(Hz)": 74.997,
                "MDVP:Jitter(%)": 0.00784, "MDVP:Jitter(Abs)": 0.00007, "MDVP:RAP": 0.00370,
                "MDVP:PPQ": 0.00554, "Jitter:DDP": 0.01109, "MDVP:Shimmer": 0.04374,
                "MDVP:Shimmer(dB)": 0.426, "Shimmer:APQ3": 0.02182, "Shimmer:APQ5": 0.03130,
                "MDVP:APQ": 0.02971, "Shimmer:DDA": 0.06545, "NHR": 0.02211, "HNR": 21.033,
                "RPDE": 0.414783, "DFA": 0.815285, "spread1": -4.813031,
                "spread2": 0.266482, "D2": 2.301442, "PPE": 0.284654,
            },
            { // Parkinson's
                "MDVP:Fo(Hz)": 122.400, "MDVP:Fhi(Hz)": 148.650, "MDVP:Flo(Hz)": 113.819,
                "MDVP:Jitter(%)": 0.00968, "MDVP:Jitter(Abs)": 0.00008, "MDVP:RAP": 0.00465,
                "MDVP:PPQ": 0.00696, "Jitter:DDP": 0.01394, "MDVP:Shimmer": 0.06134,
                "MDVP:Shimmer(dB)": 0.626, "Shimmer:APQ3": 0.03134, "Shimmer:APQ5": 0.04518,
                "MDVP:APQ": 0.04368, "Shimmer:DDA": 0.09403, "NHR": 0.01929, "HNR": 19.085,
                "RPDE": 0.458359, "DFA": 0.819521, "spread1": -4.075192,
                "spread2": 0.335590, "D2": 2.486855, "PPE": 0.368674,
            },
            { // Healthy
                "MDVP:Fo(Hz)": 197.076, "MDVP:Fhi(Hz)": 206.896, "MDVP:Flo(Hz)": 192.055,
                "MDVP:Jitter(%)": 0.00289, "MDVP:Jitter(Abs)": 0.00001, "MDVP:RAP": 0.00166,
                "MDVP:PPQ": 0.00168, "Jitter:DDP": 0.00498, "MDVP:Shimmer": 0.01098,
                "MDVP:Shimmer(dB)": 0.097, "Shimmer:APQ3": 0.00563, "Shimmer:APQ5": 0.00680,
                "MDVP:APQ": 0.00802, "Shimmer:DDA": 0.01689, "NHR": 0.00339, "HNR": 26.775,
                "RPDE": 0.422229, "DFA": 0.741367, "spread1": -7.348300,
                "spread2": 0.177551, "D2": 1.743867, "PPE": 0.085569,
            },
            { // Parkinson's
                "MDVP:Fo(Hz)": 162.568, "MDVP:Fhi(Hz)": 198.346, "MDVP:Flo(Hz)": 77.630,
                "MDVP:Jitter(%)": 0.00502, "MDVP:Jitter(Abs)": 0.00003, "MDVP:RAP": 0.00280,
                "MDVP:PPQ": 0.00253, "Jitter:DDP": 0.00841, "MDVP:Shimmer": 0.02998,
                "MDVP:Shimmer(dB)": 0.282, "Shimmer:APQ3": 0.01570, "Shimmer:APQ5": 0.01957,
                "MDVP:APQ": 0.02247, "Shimmer:DDA": 0.04711, "NHR": 0.01570, "HNR": 20.651,
                "RPDE": 0.410730, "DFA": 0.785411, "spread1": -5.373844,
                "spread2": 0.299385, "D2": 2.403721, "PPE": 0.295829,
            },
            { // Healthy
                "MDVP:Fo(Hz)": 228.552, "MDVP:Fhi(Hz)": 245.713, "MDVP:Flo(Hz)": 211.685,
                "MDVP:Jitter(%)": 0.00193, "MDVP:Jitter(Abs)": 0.00001, "MDVP:RAP": 0.00103,
                "MDVP:PPQ": 0.00109, "Jitter:DDP": 0.00309, "MDVP:Shimmer": 0.01374,
                "MDVP:Shimmer(dB)": 0.119, "Shimmer:APQ3": 0.00668, "Shimmer:APQ5": 0.00840,
                "MDVP:APQ": 0.01010, "Shimmer:DDA": 0.02004, "NHR": 0.00572, "HNR": 28.888,
                "RPDE": 0.396955, "DFA": 0.715289, "spread1": -6.454049,
                "spread2": 0.135020, "D2": 1.575938, "PPE": 0.077008,
            },
        ];
        const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
        const filled = {};
        features.forEach(f => (filled[f] = sample[f] !== undefined ? String(sample[f]) : ""));
        setForm(filled);
    };

    const isParkinsons = result?.prediction === "parkinsons";

    return (
        <div className="page-wrapper">
            <div className="card">
                {/* Header */}
                <div className="page-header">
                    <div className="page-icon" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>🧬</div>
                    <div>
                        <h1>Parkinson's Detection</h1>
                        <p>Voice feature analysis using Random Forest — UCI dataset</p>
                    </div>
                </div>

                {loadingFeatures ? (
                    <div style={{ textAlign: "center", padding: 32, color: "var(--text-secondary)" }}>
                        <span className="spinner" /> Loading features…
                    </div>
                ) : (
                    <>
                        {/* Sample button */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                            <button
                                onClick={fillSample}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    border: "1px solid rgba(139,92,246,0.4)",
                                    background: "rgba(139,92,246,0.1)",
                                    color: "#a78bfa",
                                    fontSize: "0.82rem",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                🧪 Load Sample
                            </button>
                        </div>

                        {/* Feature grid — grouped */}
                        {(() => {
                            const GROUPS = [
                                {
                                    label: "🎵 Fundamental Frequency",
                                    color: "#a78bfa",
                                    keys: ["MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)"],
                                },
                                {
                                    label: "📈 Jitter — Vocal Variation",
                                    color: "#22d3ee",
                                    keys: ["MDVP:Jitter(%)", "MDVP:Jitter(Abs)", "MDVP:RAP", "MDVP:PPQ", "Jitter:DDP"],
                                },
                                {
                                    label: "📉 Shimmer — Amplitude Variation",
                                    color: "#fbbf24",
                                    keys: ["MDVP:Shimmer", "MDVP:Shimmer(dB)", "Shimmer:APQ3", "Shimmer:APQ5", "MDVP:APQ", "Shimmer:DDA"],
                                },
                                {
                                    label: "🔬 Nonlinear Dynamics",
                                    color: "#f472b6",
                                    keys: ["NHR", "HNR", "RPDE", "DFA", "spread1", "spread2", "D2", "PPE"],
                                },
                            ];

                            return GROUPS.map(group => (
                                <div key={group.label} style={{ marginBottom: 24 }}>
                                    {/* Group header */}
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 10,
                                        marginBottom: 12,
                                    }}>
                                        <span style={{
                                            fontSize: "0.82rem", fontWeight: 700, color: group.color,
                                            letterSpacing: "0.03em", whiteSpace: "nowrap",
                                        }}>{group.label}</span>
                                        <span style={{ flex: 1, height: 1, background: `${group.color}30` }} />
                                    </div>
                                    {/* Fields */}
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                        gap: "10px 14px",
                                    }}>
                                        {group.keys.filter(k => features.includes(k)).map(feat => (
                                            <div key={feat}>
                                                <div className="field-label" style={{ fontSize: "0.72rem", marginBottom: 4 }}>
                                                    {feat}
                                                </div>
                                                <input
                                                    id={`field-${feat}`}
                                                    type="number"
                                                    name={feat}
                                                    step="any"
                                                    value={form[feat]}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    style={{
                                                        width: "100%", padding: "8px 10px",
                                                        borderRadius: 8,
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        background: "rgba(255,255,255,0.05)",
                                                        color: "var(--text-primary)",
                                                        fontSize: "0.85rem", outline: "none",
                                                        boxSizing: "border-box",
                                                    }}
                                                    onFocus={e => (e.target.style.borderColor = `${group.color}70`)}
                                                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}

                        {/* Predict button */}
                        <button
                            id="predict-btn"
                            className="btn-primary"
                            onClick={predict}
                            disabled={loading || !allFilled}
                        >
                            {loading ? (
                                <><span className="spinner" /> Analyzing…</>
                            ) : (
                                <><span>🧬</span> Run Prediction</>
                            )}
                        </button>

                        {loading && (
                            <div className="result-box skeleton-box" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                                <div className="skeleton-text" style={{ width: "30%", height: 16, marginBottom: 16 }} />
                                <div className="skeleton-text" style={{ width: "50%", height: 32, marginBottom: 20, borderRadius: 99 }} />
                                <div className="skeleton-text" style={{ height: "4em", marginBottom: 20 }} />
                                <div className="skeleton-text" style={{ width: "100%", height: 8, borderRadius: 99 }} />
                            </div>
                        )}

                        {/* Result */}
                        {!loading && result && (
                            <div className={`result-box ${isParkinsons ? "glow-red" : "glow-green"}`} style={{
                                borderColor: isParkinsons
                                    ? "rgba(244,63,94,0.3)"
                                    : "rgba(34,197,94,0.3)",
                                background: isParkinsons
                                    ? "rgba(244,63,94,0.06)"
                                    : "rgba(34,197,94,0.06)",
                            }}>
                                <h3>Prediction Result</h3>

                                <span className="badge" style={{
                                    background: isParkinsons
                                        ? "rgba(244,63,94,0.2)"
                                        : "rgba(34,197,94,0.2)",
                                    color: isParkinsons ? "#fb7185" : "#4ade80",
                                    border: `1px solid ${isParkinsons ? "rgba(244,63,94,0.35)" : "rgba(34,197,94,0.35)"}`,
                                    fontSize: "1rem",
                                    padding: "6px 16px",
                                }}>
                                    {isParkinsons ? "🔴 Parkinson's Detected" : "🟢 Parkinson's Not Detected"}
                                </span>

                                <div className="confidence-row" style={{ marginTop: 16 }}>
                                    <span>Confidence Score</span>
                                    <span className="confidence-value">
                                        {(result.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${result.confidence * 100}%`,
                                            background: isParkinsons
                                                ? "linear-gradient(90deg, #f43f5e, #fb7185)"
                                                : "linear-gradient(90deg, #22c55e, #4ade80)",
                                        }}
                                    />
                                </div>

                                <p style={{
                                    marginTop: 14,
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                    fontStyle: "italic",
                                }}>
                                    ⚠️ This is an ML demo — not a medical diagnosis.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}

export default Parkinsons;
