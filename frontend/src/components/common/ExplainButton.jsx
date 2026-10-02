import { HelpCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function ExplainButton({ title, explanation, simpleConcept, technicalTerm }) {
  const { setExplainModalContent } = useApp();

  const handleClick = (e) => {
    e.stopPropagation();
    setExplainModalContent({
      title: title || "Security Concept Explanation",
      explanation: explanation || "This component displays security telemetry and hospital operational status.",
      simpleConcept: simpleConcept || "Explains what this data means in plain language.",
      technicalTerm: technicalTerm || "Technical indicator detail",
    });
  };

  return (
    <button
      className="explain-btn"
      onClick={handleClick}
      title="Explain this feature in simple language"
      aria-label="Explain concept"
    >
      <HelpCircle size={14} />
      <span>Explain</span>
    </button>
  );
}

export function ExplainModal() {
  const { explainModalContent, setExplainModalContent } = useApp();

  if (!explainModalContent) return null;

  return (
    <div className="modal-overlay" onClick={() => setExplainModalContent(null)}>
      <div className="modal-card explain-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="explain-modal-header-icon">💡</div>
          <div>
            <h3>{explainModalContent.title}</h3>
            <p className="modal-subtitle">Simple Visual Explanation</p>
          </div>
          <button className="close-btn" onClick={() => setExplainModalContent(null)}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {explainModalContent.technicalTerm && (
            <div className="explain-box technical">
              <span className="box-tag">TECHNICAL METRIC</span>
              <p>{explainModalContent.technicalTerm}</p>
            </div>
          )}

          <div className="explain-box simple">
            <span className="box-tag">PLAIN LANGUAGE SUMMARY</span>
            <p>{explainModalContent.explanation}</p>
          </div>

          {explainModalContent.simpleConcept && (
            <div className="explain-box concept">
              <span className="box-tag">WHY IT MATTERS</span>
              <p>{explainModalContent.simpleConcept}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="primary-button" onClick={() => setExplainModalContent(null)}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
