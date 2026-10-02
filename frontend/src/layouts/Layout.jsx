import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import { CommandPalette } from "../components/common/CommandPalette";
import { VoiceSOCModal } from "../components/common/VoiceSOCModal";
import { NotificationDrawer } from "../components/common/NotificationDrawer";
import { ExplainModal } from "../components/common/ExplainButton";
import { useApp } from "../context/AppContext";

import { ErrorBoundary } from "../components/common/ErrorBoundary";

function Layout() {
  const { mode, explainMode } = useApp();

  return (
    <div className={`app-shell mode-${mode}`}>
      <Sidebar />

      <main className="main-area">
        <Topbar />

        {explainMode && (
          <div className="global-explain-banner">
            <span className="banner-icon">💡</span>
            <div>
              <strong>Global Explain Mode Active</strong>
              <p>Hover or click any security widget to see simplified explanations for non-technical users.</p>
            </div>
          </div>
        )}

        <section className="content-area">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </section>
      </main>

      {/* Global Modals & Drawers */}
      <CommandPalette />
      <VoiceSOCModal />
      <NotificationDrawer />
      <ExplainModal />
    </div>
  );
}

export default Layout;