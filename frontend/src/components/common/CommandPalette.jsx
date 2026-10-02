import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutDashboard, Network, ShieldAlert, Siren, History, FileText, Zap, BrainCircuit, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function CommandPalette() {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, setSelectedAsset, setSelectedIncident } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const commands = [
    { label: "Go to Dashboard", icon: LayoutDashboard, action: () => navigate("/dashboard") },
    { label: "Open Digital Twin", icon: Network, action: () => navigate("/digital-twin") },
    { label: "Show Security Alerts", icon: ShieldAlert, action: () => navigate("/alerts") },
    { label: "Manage Incidents", icon: Siren, action: () => navigate("/incidents") },
    { label: "AI Threat Analysis", icon: BrainCircuit, action: () => navigate("/ai-analysis") },
    { label: "Open Response Center", icon: Zap, action: () => navigate("/response") },
    { label: "Open Forensic Time Machine", icon: History, action: () => navigate("/forensics") },
    { label: "Generate Report", icon: FileText, action: () => navigate("/reports") },
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (cmd) => {
    cmd.action();
    setIsCommandPaletteOpen(false);
    setQuery("");
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCommandPaletteOpen(false)}>
      <div className="command-palette-card" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-wrapper">
          <Search size={18} className="palette-search-icon" />
          <input
            type="text"
            placeholder="Search MED-VERSE (e.g., HIS-02, ransomware, ICU, Alerts)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="close-palette-btn" onClick={() => setIsCommandPaletteOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="palette-list">
          <p className="palette-group-title">SUGGESTED COMMANDS</p>
          {filtered.length === 0 ? (
            <div className="palette-empty">No matching commands or assets found for "{query}"</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button key={idx} className="palette-item" onClick={() => handleSelect(cmd)}>
                  <Icon size={16} />
                  <span>{cmd.label}</span>
                </button>
              );
            })
          )}
        </div>
        <div className="palette-footer">
          <span>Use <strong>ESC</strong> to close</span>
          <span>Press <strong>↵</strong> to select</span>
        </div>
      </div>
    </div>
  );
}
