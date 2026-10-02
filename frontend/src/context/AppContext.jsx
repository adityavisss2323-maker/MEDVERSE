import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Primary User Modes: 'analyst' (SOC Analyst) or 'simple' (Executive/Simple User)
  const [mode, setMode] = useState("analyst");
  
  // Dashboard & Navigation controls
  const [focusMode, setFocusMode] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [explainMode, setExplainMode] = useState(false);
  const [demoMode] = useState(true);

  // Global search & command palette
  const [searchQuery, setSearchQuery] = useState("");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isVoiceSocOpen, setIsVoiceSocOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Selected Entity state for inter-page investigation
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [explainModalContent, setExplainModalContent] = useState(null);

  const toggleMode = () => setMode((prev) => (prev === "analyst" ? "simple" : "analyst"));

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        focusMode,
        setFocusMode,
        liveMode,
        setLiveMode,
        explainMode,
        setExplainMode,
        demoMode,
        searchQuery,
        setSearchQuery,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isVoiceSocOpen,
        setIsVoiceSocOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        selectedAsset,
        setSelectedAsset,
        selectedIncident,
        setSelectedIncident,
        selectedAlert,
        setSelectedAlert,
        explainModalContent,
        setExplainModalContent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
