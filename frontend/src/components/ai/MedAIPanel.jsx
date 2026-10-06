import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { useAI } from "../../context/AIContext";
import { aiService } from "../../services/aiService";
import { voiceService } from "../../services/voiceService";
import { SUPPORTED_LANGUAGES } from "../../types";

export function MedAIPanel() {
  const {
    isAIOpen,
    closeAI,
    currentContext,
    selectedLanguage,
    setSelectedLanguage
  } = useAI();

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "### 👋 Hello! I am MED-AI\n\nYour integrated SOC Copilot & Healthcare Cybersecurity Assistant.\n\nI can analyze active alerts, summarize incidents, audit logs, inspect uploaded PCAPs/logs, and recommend defensive containment steps."
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle"); // idle | listening | speaking

  // Action Confirmation Modal
  const [selectedAction, setSelectedAction] = useState(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // File / Document Analysis Modal
  const [uploadState, setUploadState] = useState(null); // { type, data, status }
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAIOpen) scrollToBottom();
  }, [messages, isAIOpen]);

  if (!isAIOpen) return null;

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage({
        message: textToSend,
        context: currentContext,
        language: selectedLanguage
      });

      const aiMsg = {
        id: response.id,
        sender: "ai",
        text: response.text,
        recommendationCard: response.recommendationCard
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: "⚠️ System Notice: Unable to connect to MED-AI backend. Please check network connection."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      voiceService.stopListening();
      voiceService.stopSpeaking();
      setIsVoiceActive(false);
      setVoiceStatus("idle");
    } else {
      setIsVoiceActive(true);
      setVoiceStatus("listening");
      voiceService.startListening(
        (transcript) => {
          setVoiceStatus("idle");
          setIsVoiceActive(false);
          handleSendMessage(transcript);
        },
        () => {
          setVoiceStatus("idle");
          setIsVoiceActive(false);
        }
      );
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setUploadState({ status: "analyzing", fileName: file.name });
    setIsLoading(true);

    try {
      if (file.type.startsWith("image/")) {
        const result = await aiService.analyzeImage(file);
        setUploadState({ type: "image", data: result, status: "complete" });
        setMessages((prev) => [
          ...prev,
          {
            id: `img_${Date.now()}`,
            sender: "ai",
            text: `### 📷 Image Analysis Complete: ${file.name}\n\n**Detected Information:**\n${result.detectedInformation}\n\n**Potential Risks:**\n${result.potentialRisks.map((r) => `- ${r}`).join("\n")}\n\n**Recommendations:**\n${result.recommendations.map((r) => `- ${r}`).join("\n")}`
          }
        ]);
      } else {
        const result = await aiService.analyzeFile(file);
        setUploadState({ type: "doc", data: result, status: "complete" });
        setMessages((prev) => [
          ...prev,
          {
            id: `file_${Date.now()}`,
            sender: "ai",
            text: `### 📄 Document Analysis: ${file.name}\n\n**Executive Summary:**\n${result.executiveSummary}\n\n**Key Findings:**\n${result.keyFindings.map((k) => `- ${k}`).join("\n")}\n\n**Indicators of Compromise (IoCs):**\n${result.indicatorsOfCompromise.map((ioc) => `\`${ioc}\``).join(" • ")}`
          }
        ]);
      }
    } catch (err) {
      setUploadState({ status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedAction) return;
    setIsExecutingAction(true);
    try {
      const res = await aiService.executeDefensiveAction(selectedAction);
      setActionSuccess(res);
    } catch (err) {
      alert("Execution failed.");
    } finally {
      setIsExecutingAction(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="med-ai-panel-overlay">
      <div className="med-ai-panel">
        {/* PANEL HEADER */}
        <div className="ai-panel-header">
          <div className="header-left">
            <div className="ai-badge">
              <Sparkles size={16} />
              <span>MED-AI Copilot</span>
            </div>
            {currentContext && (
              <span className="context-chip" title="Active Page Context">
                Context: {currentContext.alert?.id || currentContext.incident?.id || "Page Analysis"}
              </span>
            )}
          </div>

          <div className="header-right">
            {/* Language Selector */}
            <div className="lang-select-wrapper">
              <Globe size={14} className="lang-icon" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="ai-lang-select"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="panel-icon-btn"
              onClick={() =>
                setMessages([
                  {
                    id: "welcome",
                    sender: "ai",
                    text: "Conversation cleared. Ready for security analysis."
                  }
                ])
              }
              title="Clear Conversation"
            >
              <Trash2 size={16} />
            </button>

            <button className="panel-icon-btn close-btn" onClick={closeAI} title="Close Panel">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MESSAGES BODY */}
        <div className="ai-messages-body">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`ai-message-row ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === "ai" ? <Sparkles size={14} /> : "YOU"}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {msg.text.split("\n\n").map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.startsWith("### ")
                        ? <strong>{paragraph.replace("### ", "")}</strong>
                        : paragraph}
                    </p>
                  ))}
                </div>

                {/* DEFENSIVE ACTION RECOMMENDATION CARD */}
                {msg.recommendationCard && (
                  <div className="ai-action-card">
                    <div className="action-card-header">
                      <ShieldAlert size={16} className="text-warning" />
                      <strong>AI Recommendation</strong>
                    </div>
                    <p className="action-title">{msg.recommendationCard.title}</p>
                    <p className="action-impact">{msg.recommendationCard.impact}</p>

                    <button
                      className="secondary-button review-action-btn"
                      onClick={() => setSelectedAction(msg.recommendationCard)}
                    >
                      <Play size={13} />
                      <span>Review Defensive Action</span>
                    </button>
                  </div>
                )}

                {msg.sender === "ai" && (
                  <button
                    className="copy-msg-btn"
                    onClick={() => copyToClipboard(msg.text, idx)}
                    title="Copy response"
                  >
                    {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-message-row ai loading">
              <div className="message-avatar">
                <Sparkles size={14} className="spin" />
              </div>
              <div className="message-content">
                <div className="ai-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTION CHIPS */}
        <div className="ai-quick-prompts">
          <button
            onClick={() => handleSendMessage("Analyze active threats on ransomware dashboard")}
          >
            🛡️ Analyze Threats
          </button>
          <button
            onClick={() => handleSendMessage("Summarize current SOC incidents")}
          >
            📋 Incident Summary
          </button>
          <button
            onClick={() => handleSendMessage("Suggest containment steps for HIS server")}
          >
            ⚡ Endpoint Containment
          </button>
        </div>

        {/* INPUT CONTROL BAR */}
        <div className="ai-input-bar">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.txt,.csv,.json,.log,.pcap,.png,.jpg,.jpeg"
          />

          <button
            className="input-tool-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Document, PCAP, or Screenshot for AI Analysis"
          >
            <Paperclip size={18} />
          </button>

          <button
            className={`input-tool-btn voice-btn ${isVoiceActive ? "active" : ""}`}
            onClick={handleVoiceToggle}
            title={isVoiceActive ? "Stop Voice Interaction" : "Voice AI Assistant"}
          >
            {isVoiceActive ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            placeholder={
              isVoiceActive
                ? "Listening to voice input..."
                : "Ask MED-AI about threats, logs, alerts..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading || isVoiceActive}
          />

          <button
            className="send-msg-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* DEFENSIVE ACTION CONFIRMATION MODAL */}
      {selectedAction && (
        <div className="modal-backdrop">
          <div className="modal-box action-review-modal">
            <div className="modal-header">
              <ShieldAlert size={20} className="text-warning" />
              <h3>Defensive Action Confirmation</h3>
              <button className="close-btn" onClick={() => setSelectedAction(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {!actionSuccess ? (
                <>
                  <div className="action-details-card">
                    <h4>{selectedAction.title}</h4>
                    <p>
                      <strong>Action Type:</strong> {selectedAction.actionType}
                    </p>
                    <p>
                      <strong>Impact Analysis:</strong> {selectedAction.impact}
                    </p>
                    <div className="risk-rating">
                      <span>Target Risk Score:</span>
                      <strong className="text-critical">{selectedAction.riskScore} / 100</strong>
                    </div>
                  </div>

                  <div className="warning-callout">
                    <AlertTriangle size={16} />
                    <span>
                      Execution severs traffic to the specified network node. This operation requires SOC authorization confirmation.
                    </span>
                  </div>
                </>
              ) : (
                <div className="execution-success-state">
                  <CheckCircle2 size={44} className="text-success" />
                  <h4>Defensive Action Dispatched</h4>
                  <p>{actionSuccess.message}</p>
                  <small>Execution ID: {actionSuccess.executionId}</small>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {!actionSuccess ? (
                <>
                  <button
                    className="secondary-button"
                    onClick={() => setSelectedAction(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-button danger"
                    onClick={handleExecuteAction}
                    disabled={isExecutingAction}
                  >
                    {isExecutingAction ? "Dispatching..." : "Confirm & Execute"}
                  </button>
                </>
              ) : (
                <button
                  className="primary-button"
                  onClick={() => {
                    setSelectedAction(null);
                    setActionSuccess(null);
                  }}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
