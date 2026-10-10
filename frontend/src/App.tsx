import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { MobileNavBar } from "./components/MobileNavBar";
import { Footer } from "./components/Footer";
import { VideoBackground } from "./components/VideoBackground";
import { RacesPage } from "./pages/RacesPage";

const RaceDetailPage = lazy(() =>
  import("./pages/RaceDetailPage").then((m) => ({ default: m.RaceDetailPage }))
);
const DriverExplainerPage = lazy(() =>
  import("./pages/DriverExplainerPage").then((m) => ({
    default: m.DriverExplainerPage,
  }))
);
const ReplayPage = lazy(() =>
  import("./pages/ReplayPage").then((m) => ({ default: m.ReplayPage }))
);

const RouteLoadingFallback = () => (
  <div
    style={{
      minHeight: "400px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--color-text-muted)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      letterSpacing: "0.08em",
    }}
  >
    LOADING TELEMETRY...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <VideoBackground />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "transparent",
          color: "var(--color-text-primary)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Navbar />

        <main
          style={{
            flex: 1,
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "var(--space-6) var(--space-4)",
            boxSizing: "border-box",
          }}
        >
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<RacesPage />} />
              <Route path="/races" element={<RacesPage />} />
              <Route path="/races/:sessionKey" element={<RaceDetailPage />} />
              <Route
                path="/races/:sessionKey/driver/:driverNumber"
                element={<DriverExplainerPage />}
              />
              <Route
                path="/races/:sessionKey/drivers/:driverNumber"
                element={<DriverExplainerPage />}
              />
              <Route path="/races/:sessionKey/replay" element={<ReplayPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
        <MobileNavBar />
      </div>
    </BrowserRouter>
  );
}

export default App;
