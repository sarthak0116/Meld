import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { ArenaProvider } from "./context/ArenaContext";
import App from "./App.jsx";
import CustomCursor from "./components/arena/CustomCursor.jsx";
import "./styles/index.css";
import "@fontsource/exo-2";
import "@fontsource/tektur";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ArenaProvider>
        <CustomCursor />
        <App />
      </ArenaProvider>
    </AuthProvider>
  </StrictMode>,
);
