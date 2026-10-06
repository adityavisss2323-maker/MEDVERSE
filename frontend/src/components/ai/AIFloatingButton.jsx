import { Sparkles } from "lucide-react";
import { useAI } from "../../context/AIContext";

export function AIFloatingButton() {
  const { toggleAI, isAIOpen } = useAI();

  if (isAIOpen) return null;

  return (
    <button
      className="med-ai-floating-btn"
      onClick={toggleAI}
      title="Open MED-AI SOC Copilot Assistant"
      aria-label="MED-AI Assistant"
    >
      <div className="btn-glow-ring"></div>
      <Sparkles className="sparkle-icon" size={18} />
      <span className="btn-label">MED-AI</span>
      <span className="ai-status-pulse"></span>
    </button>
  );
}
