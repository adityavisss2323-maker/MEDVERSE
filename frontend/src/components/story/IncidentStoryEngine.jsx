import { useState, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, X, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";
import { SeverityBadge } from "../common/StatusBadge";

export function IncidentStoryEngine({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const storySteps = [
    {
      step: 1,
      number: "01",
      title: "Suspicious Login Attempt",
      asset: "Doctor-PC-04",
      department: "Emergency",
      severity: "Medium",
      time: "08:42 AM",
      summary: "An administrator login occurred on an emergency workstation outside standard shift hours.",
      evidence: "Logon Event 4624 (Logon Type 2) from IP 10.20.4.15.",
    },
    {
      step: 2,
      number: "02",
      title: "Unusual Network Scan",
      asset: "Doctor-PC-04",
      department: "Emergency",
      severity: "High",
      time: "08:46 AM",
      summary: "Doctor-PC-04 began sending port probes across adjacent hospital subnets.",
      evidence: "SYN packets targeted ports 445 (SMB) and 135 (RPC).",
    },
    {
      step: 3,
      number: "03",
      title: "Malicious File Execution",
      asset: "Doctor-PC-04",
      department: "Emergency",
      severity: "High",
      time: "08:50 AM",
      summary: "An unverified script extracted domain credentials from system memory.",
      evidence: "LSASS process memory access flagged by EDR agent.",
    },
    {
      step: 4,
      number: "04",
      title: "Lateral Movement Across Switch",
      asset: "Core-Switch-01",
      department: "Administration",
      severity: "High",
      time: "08:53 AM",
      summary: "Stolen credentials were used to establish an SMB session with central hospital servers.",
      evidence: "Admin SMB session routed from 10.20.4.15 to 10.20.1.22.",
    },
    {
      step: 5,
      number: "05",
      title: "HIS EHR Server Access",
      asset: "HIS-Server-02",
      department: "Administration",
      severity: "Critical",
      time: "08:58 AM",
      summary: "An unauthorized administrative shell was spawned on the core patient database server.",
      evidence: "Inbound SSH root session accepted from Emergency Workstation 04.",
    },
    {
      step: 6,
      number: "06",
      title: "Ransomware Behavior Detected",
      asset: "HIS-Server-02",
      department: "Administration",
      severity: "Critical",
      time: "09:01 AM",
      summary: "AI Monitoring detected rapid sequential file extension modifications across patient records.",
      evidence: "420 file extension alterations detected within 3 seconds.",
    },
    {
      step: 7,
      number: "07",
      title: "Simulated Device Isolation",
      asset: "HIS-Server-02",
      department: "Administration",
      severity: "High",
      time: "09:04 AM",
      summary: "The automated SOC safety system isolated HIS-Server-02 to prevent further spread.",
      evidence: "SIMULATED_ISOLATION action completed for 10.20.1.22.",
    },
  ];

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= storySteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, storySteps.length]);

  const activeStory = storySteps[currentStep];

  return (
    <div
      className="story-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11, 19, 41, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        className="story-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "780px",
          maxWidth: "95vw",
          background: "#0f172a",
          color: "#f8fafc",
          borderRadius: "16px",
          border: "1px solid rgba(6, 182, 212, 0.35)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(6, 182, 212, 0.2)",
          overflow: "hidden",
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: "20px 24px",
            background: "#0b1329",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="story-header-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Sparkles size={22} style={{ color: "#06b6d4" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>MED-VERSE Incident Story Engine</h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Visual Chronological Narrative (Incident INC-1042)</p>
            </div>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "6px" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="story-body" style={{ padding: "24px" }}>
          {/* STEP PROGRESSION BAR */}
          <div
            className="story-stepper"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              margin: "10px 0 28px 0",
              padding: "0 16px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "36px",
                right: "36px",
                height: "3px",
                background: "rgba(255, 255, 255, 0.15)",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            />
            {storySteps.map((s, idx) => {
              const isActive = idx === currentStep;
              const isComp = idx < currentStep;
              return (
                <div
                  key={s.step}
                  className={`step-dot ${isActive ? "active" : ""} ${isComp ? "completed" : ""}`}
                  onClick={() => setCurrentStep(idx)}
                  title={`Stage ${s.number}: ${s.title}`}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: isActive ? "#176b87" : isComp ? "#064e3b" : "#1e293b",
                    border: isActive ? "2px solid #06b6d4" : isComp ? "2px solid #10b981" : "2px solid #475569",
                    color: isActive ? "#ffffff" : isComp ? "#34d399" : "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 2,
                    boxShadow: isActive ? "0 0 16px rgba(6, 182, 212, 0.6)" : "0 4px 6px rgba(0,0,0,0.3)",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.25s ease",
                  }}
                >
                  {isComp ? <CheckCircle2 size={18} /> : <span>{s.number}</span>}
                </div>
              );
            })}
          </div>

          {/* ACTIVE STORY CARD */}
          <div
            className={`story-card-content ${activeStory.severity.toLowerCase()}`}
            style={{
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "22px",
              borderLeft:
                activeStory.severity.toLowerCase() === "critical"
                  ? "4px solid #ef4444"
                  : activeStory.severity.toLowerCase() === "high"
                  ? "4px solid #f97316"
                  : "4px solid #f59e0b",
            }}
          >
            <div className="story-top-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span className="story-step-num" style={{ fontSize: "11px", fontWeight: 800, color: "#38bdf8", letterSpacing: "1.5px" }}>
                STAGE {activeStory.number} OF 07
              </span>
              <SeverityBadge severity={activeStory.severity} />
            </div>

            <h2 className="story-stage-title" style={{ fontSize: "20px", fontWeight: 800, color: "#f8fafc", margin: "0 0 14px 0" }}>
              {activeStory.title}
            </h2>

            <div
              className="story-meta"
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#cbd5e1",
                background: "rgba(15, 23, 42, 0.8)",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span>📍 Asset: <strong>{activeStory.asset}</strong></span>
              <span>🏥 Dept: <strong>{activeStory.department}</strong></span>
              <span>⏰ Time: <strong>{activeStory.time}</strong></span>
            </div>

            <div
              className="story-explanation-box"
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "12px",
              }}
            >
              <strong style={{ color: "#38bdf8", fontSize: "11px", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>
                What Happened:
              </strong>
              <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0", lineHeight: 1.5 }}>{activeStory.summary}</p>
            </div>

            <div
              className="story-evidence-box"
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <strong style={{ color: "#38bdf8", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>
                Forensic Evidence Telemetry:
              </strong>
              <code style={{ background: "#020617", border: "1px solid #1e293b", color: "#38bdf8", fontFamily: "monospace", padding: "8px 12px", borderRadius: "6px", display: "block", fontSize: "12px" }}>
                {activeStory.evidence}
              </code>
            </div>
          </div>

          {/* CONTROLS */}
          <div
            className="story-controls-bar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              className="secondary-button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f8fafc",
                padding: "9px 16px",
                borderRadius: "8px",
                cursor: currentStep === 0 ? "not-allowed" : "pointer",
                opacity: currentStep === 0 ? 0.5 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              className="primary-button play-story-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: "linear-gradient(135deg, #176b87 0%, #06b6d4 100%)",
                color: "#ffffff",
                border: "none",
                padding: "10px 22px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(6, 182, 212, 0.35)",
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? "Pause Narrative" : "Play Incident Story"}</span>
            </button>

            <button
              className="secondary-button"
              onClick={() => setCurrentStep((prev) => Math.min(storySteps.length - 1, prev + 1))}
              disabled={currentStep === storySteps.length - 1}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f8fafc",
                padding: "9px 16px",
                borderRadius: "8px",
                cursor: currentStep === storySteps.length - 1 ? "not-allowed" : "pointer",
                opacity: currentStep === storySteps.length - 1 ? 0.5 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
