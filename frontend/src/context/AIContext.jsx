import { createContext, useContext, useState } from "react";

const AIContext = createContext();

export function AIProvider({ children }) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const openAIWithContext = (contextData) => {
    // Ensure no sensitive authentication fields are included
    if (contextData) {
      const safeContext = { ...contextData };
      delete safeContext.password;
      delete safeContext.token;
      delete safeContext.secret;
      delete safeContext.apiKey;
      setCurrentContext(safeContext);
    }
    setIsAIOpen(true);
  };

  const toggleAI = () => setIsAIOpen((prev) => !prev);
  const closeAI = () => setIsAIOpen(false);

  return (
    <AIContext.Provider
      value={{
        isAIOpen,
        setIsAIOpen,
        toggleAI,
        closeAI,
        currentContext,
        setCurrentContext,
        openAIWithContext,
        selectedLanguage,
        setSelectedLanguage
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}
