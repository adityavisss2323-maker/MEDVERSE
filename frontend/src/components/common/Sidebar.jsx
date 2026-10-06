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
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { usePermissions } from "../../hooks/usePermissions";
import { LanguageSelector } from "./LanguageSelector";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();
  const { isManagementAuthorized, can, PERMISSIONS } = usePermissions();

  const navSections = [
    {
      title: "MONITORING",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, perm: PERMISSIONS.VIEW_DASHBOARD },
        { label: "Digital Twin", path: "/digital-twin", icon: Network, perm: PERMISSIONS.VIEW_DIGITAL_TWIN },
        { label: "Alerts", path: "/alerts", icon: ShieldAlert, perm: PERMISSIONS.VIEW_ALERTS },
        { label: "Incidents", path: "/incidents", icon: Siren, perm: PERMISSIONS.VIEW_INCIDENTS },
      ],
    },
    {
      title: "INTELLIGENCE",
      items: [
        { label: "AI Analysis", path: "/ai-analysis", icon: BrainCircuit, perm: PERMISSIONS.VIEW_AI_ANALYSIS },
        { label: "Cyber DNA", path: "/cyber-dna", icon: Dna, perm: PERMISSIONS.VIEW_CYBER_DNA },
        { label: "Attack Paths", path: "/attack-paths", icon: GitCommit, perm: PERMISSIONS.VIEW_ATTACK_PATHS },
        { label: "What-If Simulation", path: "/what-if", icon: FlaskConical, perm: PERMISSIONS.VIEW_WHAT_IF },
      ],
    },
    {
      title: "RESPONSE & INVESTIGATION",
      items: [
        { label: "Automated Response", path: "/response", icon: Zap, perm: PERMISSIONS.VIEW_RESPONSE },
        { label: "Forensic Replay", path: "/forensics", icon: History, perm: PERMISSIONS.VIEW_FORENSICS },
      ],
    },
    {
      title: "ADMINISTRATION",
      items: [
        ...(isManagementAuthorized()
          ? [{ label: "Authorization", path: "/authorization", icon: UserCheck, perm: PERMISSIONS.MANAGE_AUTHORIZATION }]
          : []),
        { label: "Reports", path: "/reports", icon: FileText, perm: PERMISSIONS.VIEW_REPORTS },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-mark">
          <Activity size={20} />
        </div>

        {!isCollapsed && (
          <div>
            <div className="brand-name">MED-VERSE</div>
            <div className="brand-subtitle">{t("header.subtitle") || "Hospital Digital Twin & SOC"}</div>
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
            {!isCollapsed && <p className="nav-title">{sec.title}</p>}

            <nav>
              {sec.items.map((item) => {
                if (item.perm && !can(item.perm)) return null;

                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {!isCollapsed && <span>{item.label}</span>}
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
                <p>SOC Status</p>
                <strong>Operational</strong>
              </div>
            </div>

            <div className="sidebar-version">
              MED-VERSE v1.0 • Enterprise SOC
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;