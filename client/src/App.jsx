import { useLayoutEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import ScrollRevealProvider from "./components/ScrollRevealProvider";
import { AuthProvider } from "./context/AuthContext";
import AdminPanel from "./pages/Admin-panel";
import AuthPage from "./pages/Auth-page";
import AboutPage from "./pages/About-page";
import ContactPage from "./pages/Contact-page";
import MainPage from "./pages/Main-page";
import PlanRoutePage from "./pages/Plan-route";
import ReportAccidentPage from "./pages/Report-accident";
import ReportHistoryPage from "./pages/Report-history";
import "./App.css";

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <>
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      <ErrorBoundary>
        <ScrollRevealProvider watchKey={location.pathname}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/plan-route" element={<PlanRoutePage />} />
            <Route path="/report-accident" element={<ReportAccidentPage />} />
            <Route path="/report-history" element={<ReportHistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
          </Routes>
        </ScrollRevealProvider>
      </ErrorBoundary>
      {!isAdminRoute && !isAuthRoute && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;



