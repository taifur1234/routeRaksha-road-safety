import { lazy, Suspense, useLayoutEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import ScrollRevealProvider from "./components/ScrollRevealProvider";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

const AdminPanel = lazy(() => import("./pages/Admin-panel"));
const AuthPage = lazy(() => import("./pages/Auth-page"));
const AboutPage = lazy(() => import("./pages/About-page"));
const ContactPage = lazy(() => import("./pages/Contact-page"));
const ErrorPreviewPage = lazy(() => import("./pages/Error-preview-page"));
const MainPage = lazy(() => import("./pages/Main-page"));
const LeaderboardPage = lazy(() => import("./pages/Leaderboard-page"));
const NotificationsPage = lazy(() => import("./pages/Notifications-page"));
const NotFoundPage = lazy(() => import("./pages/Not-found-page"));
const PlanRoutePage = lazy(() => import("./pages/Plan-route"));
const ProfilePage = lazy(() => import("./pages/Profile-page"));
const ReportAccidentPage = lazy(() => import("./pages/Report-accident"));
const ReportHistoryPage = lazy(() => import("./pages/Report-history"));

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
        <Suspense fallback={null}>
          <ScrollRevealProvider watchKey={location.pathname}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/plan-route" element={<PlanRoutePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/report-accident" element={<ReportAccidentPage />} />
              <Route path="/report-history" element={<ReportHistoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/_preview-500" element={<ErrorPreviewPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ScrollRevealProvider>
        </Suspense>
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
