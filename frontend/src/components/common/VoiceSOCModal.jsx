import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Volume2, X, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function VoiceSOCModal() {
  const { isVoiceSocOpen, setIsVoiceSocOpen } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusText, setStatusText] = useState("Click the microphone button and speak a command...");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isVoiceSocOpen) {
      setIsListening(false);
      setTranscript("");
    }
  }, [isVoiceSocOpen]);

  if (!isVoiceSocOpen) return null;

  const handleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusText("Speech Recognition is not supported by your browser. Please use the fallback command buttons below.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText("Listening for SOC commands...");
      };

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setTranscript(text);
        processCommand(text);
      };

      recognition.onerror = (e) => {
        setIsListening(false);
        setStatusText(`Voice input error: ${e.error}. Try quick preset commands below.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setStatusText("Speech Recognition initialization failed. Use preset buttons below.");
    }
  };

  const processCommand = (cmdText) => {
    const text = cmdText.toLowerCase();

    if (text.includes("alert") || text.includes("critical")) {
      setStatusText("Navigating to Security Alerts...");
      setTimeout(() => {
        navigate("/alerts");
        setIsVoiceSocOpen(false);
      }, 800);
    } else if (text.includes("twin") || text.includes("digital")) {
      setStatusText("Opening Hospital Digital Twin...");
      setTimeout(() => {
        navigate("/digital-twin");
        setIsVoiceSocOpen(false);
      }, 800);
    } else if (text.includes("incident") || text.includes("ransomware")) {
      setStatusText("Opening Incidents Management...");
      setTimeout(() => {
        navigate("/incidents");
        setIsVoiceSocOpen(false);
      }, 800);
    } else if (text.includes("forensic") || text.includes("timeline")) {
      setStatusText("Opening Forensic Time Machine...");
      setTimeout(() => {
        navigate("/forensics");
        setIsVoiceSocOpen(false);
      }, 800);
    } else if (text.includes("report")) {
      setStatusText("Opening Reports Generator...");
      setTimeout(() => {
        navigate("/reports");
        setIsVoiceSocOpen(false);
      }, 800);
    } else {
      setStatusText(`Recognized: "${cmdText}". Command mapped.`);
    }
  };

  const presetCommands = [
    "Show critical alerts",
    "Open Digital Twin",
    "Show today's incidents",
    "Open forensic timeline",
    "Generate report",
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsVoiceSocOpen(false)}>
      <div className="voice-soc-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="voice-header-title">
            <Volume2 size={20} className="teal-icon" />
            <div>
              <h3>Voice SOC Assistant</h3>
              <p className="modal-subtitle">Voice-Guided Hospital Command Center</p>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsVoiceSocOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="voice-body">
          <div className={`mic-pulse-wrapper ${isListening ? "listening" : ""}`}>
            <button
              className={`mic-trigger-btn ${isListening ? "active" : ""}`}
              onClick={handleSpeechRecognition}
              aria-label="Toggle Speech Recognition"
            >
              {isListening ? <Mic size={32} className="pulse-mic" /> : <MicOff size={32} />}
            </button>
          </div>

          <p className="voice-status-text">{statusText}</p>

          {transcript && (
            <div className="transcript-box">
              <span>Transcribed:</span>
              <strong>"{transcript}"</strong>
            </div>
          )}

          <div className="preset-commands-section">
            <p className="preset-title">
              <Sparkles size={14} /> Quick Preset Voice Commands
            </p>
            <div className="preset-chips">
              {presetCommands.map((cmd, i) => (
                <button
                  key={i}
                  className="preset-chip"
                  onClick={() => {
                    setTranscript(cmd);
                    processCommand(cmd);
                  }}
                >
                  🎙 "{cmd}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
