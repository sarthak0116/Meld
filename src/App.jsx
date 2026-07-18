import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage    from "./pages/HomePage";
import LoginPage   from "./pages/LoginPage";
import SignupPage  from "./pages/SignupPage";
import ArenaPage   from "./pages/ArenaPage";
import ProfilePage from "./pages/ProfilePage";
import GamesPage from "./pages/GamesPage";
import CustomCursor from "./components/arena/CustomCursor";

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null; // wait for token check before deciding
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

/** Redirects already-logged-in users away from auth pages */
function GuestRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  if (isLoggedIn) return <Navigate to="/arena" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/login"  element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/arena"  element={<ProtectedRoute><ArenaPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
