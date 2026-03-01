import { useState } from "react";
import Sentiment from "./pages/Sentiment";
import History from "./pages/History";
import FakeNews from "./pages/FakeNews";
import Movie from "./pages/Movie";
import Parkinsons from "./pages/Parkinsons";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Breadcrumb from "./components/Breadcrumb";

function App() {
  const [page, setPage] = useState("home");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar page={page} setPage={setPage} />
      {page !== "home" && <Breadcrumb page={page} setPage={setPage} />}

      <main style={{ flex: 1, width: "100%" }}>
        {page === "home" && <Home setPage={setPage} />}
        {page === "sentiment" && <Sentiment showToast={showToast} />}
        {page === "history" && <History showToast={showToast} />}
        {page === "fake-news" && <FakeNews showToast={showToast} />}
        {page === "movie" && <Movie showToast={showToast} />}
        {page === "parkinsons" && <Parkinsons showToast={showToast} />}
      </main>

      <footer className="app-footer">
        <span>MMI</span> &mdash; Flask + React &middot; 4 Models Active
      </footer>

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span style={{ fontSize: "1.2rem" }}>
              {toast.type === "error" ? "⚠️" : "✨"}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;