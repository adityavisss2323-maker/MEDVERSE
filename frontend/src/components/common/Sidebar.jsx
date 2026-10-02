import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Network,
  ShieldAlert,
  Siren,
  BrainCircuit,
  Dna,
  GitCommit,
  FlaskConical,
  Zap,
  History,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";

const navSections = [
  {
    titleKey: "nav.monitoring",
    items: [
      { labelKey: "nav.dashboard", path: "/dashboard", icon: LayoutDashboard },
      { labelKey: "nav.digitalTwin", path: "/digital-twin", icon: Network },
      { labelKey: "nav.alerts", path: "/alerts", icon: ShieldAlert },
      { labelKey: "nav.incidents", path: "/incidents", icon: Siren },
    ],
  },
  {
    titleKey: "nav.intelligence",
    items: [
      { labelKey: "nav.aiAnalysis", path: "/ai-analysis", icon: BrainCircuit },
      { labelKey: "nav.cyberDNA", path: "/cyber-dna", icon: Dna },
      { labelKey: "nav.attackPaths", path: "/attack-paths", icon: GitCommit },
      { labelKey: "nav.whatIf", path: "/what-if", icon: FlaskConical },
    ],
  },
  {
    titleKey: "nav.responseSection",
    items: [{ labelKey: "nav.response", path: "/response", icon: Zap }],
  },
  {
    titleKey: "nav.investigation",
    items: [{ labelKey: "nav.forensics", path: "/forensics", icon: History }],
  },
  {
    titleKey: "nav.output",
    items: [{ labelKey: "nav.reports", path: "/reports", icon: FileText }],
  },
];

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-mark">
          <Activity size={20} />
        </div>

        {!isCollapsed && (
          <div>
            <div className="brand-name">MED-VERSE</div>
            <div className="brand-subtitle">{t("header.subtitle")}</div>
          </div>
        )}

        <button
          className="collapse-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="nav-container">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="nav-section">
            {!isCollapsed && <p className="nav-title">{t(sec.titleKey)}</p>}

            <nav>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    title={isCollapsed ? t(item.labelKey) : ""}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {!isCollapsed && <span>{t(item.labelKey)}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        {!isCollapsed && (
          <>
            <div className="sidebar-lang-wrapper">
              <LanguageSelector />
            </div>

            <div className="system-status">
              <span className="status-dot"></span>
              <div>
                <p>{t("header.systemStatus")}</p>
                <strong>{t("header.operational")}</strong>
              </div>
            </div>

            <div className="sidebar-version">
              MED-VERSE v1.0 • DEMO / SIMULATED DATA
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;