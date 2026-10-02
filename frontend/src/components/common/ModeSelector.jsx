import { Shield, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";

export function ModeSelector() {
  const { mode, setMode } = useApp();
  const { t } = useLanguage();

  return (
    <div className="mode-selector-pill">
      <button
        className={`mode-tab ${mode === "analyst" ? "active" : ""}`}
        onClick={() => setMode("analyst")}
        title="Show complete technical SOC metrics, IPs, and telemetry"
      >
        <Shield size={14} />
        <span>{t("header.analystMode")}</span>
      </button>

      <button
        className={`mode-tab ${mode === "simple" ? "active" : ""}`}
        onClick={() => setMode("simple")}
        title="Show plain language security status and incident stories for executive users"
      >
        <Sparkles size={14} />
        <span>{t("header.simpleMode")}</span>
      </button>
    </div>
  );
}
