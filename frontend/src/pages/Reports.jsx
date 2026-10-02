import { useState, useEffect } from "react";
import {
  FileText,
  Printer,
  Download
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import { generateIncidentReportData } from "../services/reportService";
import { ExplainButton } from "../components/common/ExplainButton";

export default function Reports() {
  const { language, setLanguage, t } = useLanguage();
  const { incidentList } = useSOC();

  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Select the first real incident from backend
  useEffect(() => {
    if (incidentList.length > 0) {
      const exists = incidentList.some(
        (inc) => String(inc.id) === String(selectedIncidentId)
      );

      if (!exists) {
        setSelectedIncidentId(String(incidentList[0].id));
      }
    }
  }, [incidentList, selectedIncidentId]);

  // Generate report
  const handleGenerate = async () => {
    if (!selectedIncidentId) {
      alert("Please select an incident.");
      return;
    }

    try {
      setIsGenerating(true);

      const incident = incidentList.find(
        (inc) => String(inc.id) === String(selectedIncidentId)
      );

      if (!incident) {
        throw new Error("Selected incident not found.");
      }

      const data = await generateIncidentReportData({
        incident,
        language
      });

      setReportData(data);
    } catch (error) {
      console.error("Report Generation Error:", error);

      setReportData(null);

      alert(
        error.message || "Failed to generate incident report."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Export report as JSON
  const handleExport = () => {
    if (!reportData) return;

    const jsonData = JSON.stringify(
      reportData,
      null,
      2
    );

    const blob = new Blob(
      [jsonData],
      {
        type: "application/json"
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `${reportData.reportId || "MED-VERSE-report"}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="page reports-page">

      {/* PAGE HEADER */}

      <div className="page-header no-print">

        <div>

          <p className="eyebrow">
            DOCUMENTATION & COMPLIANCE
          </p>

          <h1>
            {t("reports.title")}
          </h1>

          <p className="page-description">
            {t("reports.subtitle")}
          </p>

        </div>

        <ExplainButton
          title="Multilingual Report Center"
          explanation="Generates formal executive security reports in English, Hindi, or Gujarati for hospital directors and auditors."
          simpleConcept="Click Generate Report to view a formatted summary ready for print or PDF export."
        />

      </div>

      {/* REPORT CONTROLS */}

      <div className="dashboard-card reports-controls-card no-print">

        <h3>
          Report Parameters
        </h3>

        <div className="controls-form-grid">

          {/* INCIDENT */}

          <div className="form-item">

            <label>
              Select Incident:
            </label>

            <select
              value={selectedIncidentId}
              onChange={(e) =>
                setSelectedIncidentId(e.target.value)
              }
              disabled={incidentList.length === 0}
            >

              {incidentList.length === 0 ? (

                <option value="">
                  No incidents available
                </option>

              ) : (

                incidentList.map((inc) => (

                  <option
                    key={inc.id}
                    value={inc.id}
                  >
                    {inc.id} — {inc.title}
                  </option>

                ))

              )}

            </select>

          </div>

          {/* LANGUAGE */}

          <div className="form-item">

            <label>
              {t("reports.languageLabel")}:
            </label>

            <div className="lang-buttons-row">

              <button
                className={`lang-chip ${
                  language === "en"
                    ? "active"
                    : ""
                }`}
                onClick={() => setLanguage("en")}
              >
                English
              </button>

              <button
                className={`lang-chip ${
                  language === "hi"
                    ? "active"
                    : ""
                }`}
                onClick={() => setLanguage("hi")}
              >
                हिंदी (Hindi)
              </button>

              <button
                className={`lang-chip ${
                  language === "gu"
                    ? "active"
                    : ""
                }`}
                onClick={() => setLanguage("gu")}
              >
                ગુજરાતી (Gujarati)
              </button>

            </div>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="report-action-buttons">

          <button
            className="primary-button"
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              incidentList.length === 0 ||
              !selectedIncidentId
            }
          >

            <FileText size={16} />

            <span>
              {isGenerating
                ? "Generating..."
                : t("reports.generateReport")}
            </span>

          </button>

          {reportData && (
            <>
              <button
                className="secondary-button"
                onClick={handlePrint}
              >
                <Printer size={16} />

                <span>
                  {t("reports.printReport")}
                </span>
              </button>

              <button
                className="secondary-button"
                onClick={handleExport}
              >
                <Download size={16} />

                <span>
                  {t("reports.exportData")}
                </span>
              </button>
            </>
          )}

        </div>

      </div>

      {/* REPORT */}

      {reportData ? (

        <div className="report-paper-container">

          <div className="report-paper">

            {/* REPORT HEADER */}

            <div className="report-header">

              <div className="rep-brand">

                <h2>
                  MED-VERSE
                </h2>

                <p>
                  Hospital Cyber SOC Command Center
                </p>

              </div>

              <div className="rep-classification">

                <span className="class-badge">
                  {reportData.classification}
                </span>

                <span className="rep-date">
                  Report ID:{" "}
                  {reportData.reportId}
                  {" | "}
                  {reportData.generatedAt}
                </span>

              </div>

            </div>

            <hr className="rep-divider" />

            <h1 className="rep-title">
              {reportData.title}
            </h1>

            <p className="rep-subtitle">
              Target Incident:{" "}
              {reportData.incidentId}
              {" — "}
              {reportData.incidentTitle}
            </p>

            {/* EXECUTIVE SUMMARY */}

            <div className="rep-section">

              <h3>
                1. Executive Summary & Root Cause Analysis
              </h3>

              <p>
                <strong>
                  Incident Summary:
                </strong>{" "}
                {reportData.summary}
              </p>

              <p style={{ marginTop: "8px" }}>
                <strong>
                  Root Cause Analysis:
                </strong>{" "}
                {reportData.rootCause}
              </p>

              <div className="rep-meta-grid">

                <div>
                  <span>
                    Department:
                  </span>{" "}
                  <strong>
                    {reportData.department}
                  </strong>
                </div>

                <div>
                  <span>
                    Severity Level:
                  </span>{" "}
                  <strong>
                    {reportData.severity}
                  </strong>
                </div>

                <div>
                  <span>
                    AI Confidence:
                  </span>{" "}
                  <strong>
                    {reportData.aiConfidence}%
                  </strong>
                </div>

              </div>

            </div>

            {/* IMPACT ASSESSMENT */}

            {reportData.impactAssessment && (

              <div className="rep-section">

                <h3>
                  2. Financial & Operational Impact Assessment
                </h3>

                <div
                  className="rep-meta-grid"
                  style={{
                    gridTemplateColumns: "1fr 1fr"
                  }}
                >

                  <div>
                    <span>
                      Financial Risk Exposure:
                    </span>{" "}
                    <strong>
                      {
                        reportData
                          .impactAssessment
                          .estimatedFinancialExposure
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Patient Care Disruption:
                    </span>{" "}
                    <strong>
                      {
                        reportData
                          .impactAssessment
                          .patientCareDisruption
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Data Exfiltration Exposure:
                    </span>{" "}
                    <strong>
                      {
                        reportData
                          .impactAssessment
                          .dataExfiltrationRisk
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Downtime Prevented:
                    </span>{" "}
                    <strong>
                      {
                        reportData
                          .impactAssessment
                          .downtimePrevented
                      }
                    </strong>
                  </div>

                </div>

              </div>

            )}

            {/* COMPLIANCE AUDIT */}

            {reportData.complianceAudit && (

              <div className="rep-section">

                <h3>
                  3. Healthcare Regulatory Compliance Audit
                </h3>

                <table className="rep-table">

                  <thead>

                    <tr>
                      <th>
                        Standard / Regulation
                      </th>

                      <th>
                        Audit Status
                      </th>

                      <th>
                        Compliance Details
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {reportData.complianceAudit.map(
                      (c, i) => (

                        <tr key={i}>

                          <td>
                            <strong>
                              {c.standard}
                            </strong>
                          </td>

                          <td>
                            ✓ {c.status}
                          </td>

                          <td>
                            {c.detail}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

            {/* TELEMETRY LOGS */}

            {reportData.telemetryLogs && (

              <div className="rep-section">

                <h3>
                  4. Forensic Technical Telemetry Logs
                </h3>

                <table className="rep-table">

                  <thead>

                    <tr>
                      <th>Timestamp</th>
                      <th>Source IP</th>
                      <th>Target Endpoint</th>
                      <th>Log Event & Process ID</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {reportData.telemetryLogs.map(
                      (log, i) => (

                        <tr key={i}>

                          <td>
                            <code>
                              {log.timestamp}
                            </code>
                          </td>

                          <td>
                            <code>
                              {log.sourceIp}
                            </code>
                          </td>

                          <td>
                            <code>
                              {log.target}
                            </code>
                          </td>

                          <td>
                            {log.logEvent}
                          </td>

                          <td>
                            <strong>
                              {log.status}
                            </strong>
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

            {/* TIMELINE */}

            <div className="rep-section">

              <h3>
                5. Incident Timeline
              </h3>

              <table className="rep-table">

                <thead>

                  <tr>
                    <th>Time</th>
                    <th>
                      Forensic Event Summary
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {reportData.timeline?.map(
                    (item, i) => (

                      <tr key={i}>

                        <td>
                          <code>
                            {item.time}
                          </code>
                        </td>

                        <td>
                          {item.event}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* RECOMMENDATIONS */}

            <div className="rep-section">

              <h3>
                6. Multi-Phase Remediation Roadmap
              </h3>

              <ul className="rep-bullet-list">

                {reportData.recommendations?.map(
                  (rec, idx) => (

                    <li key={idx}>
                      {rec}
                    </li>

                  )
                )}

              </ul>

            </div>

            {/* FOOTER */}

            <div className="report-footer">

              <p>
                Generated by MED-VERSE Hospital Cyber Digital Twin & Forensic Time Machine.
              </p>

              <p>
                Confidential Demonstration Document • University Project Evaluation
              </p>

            </div>

          </div>

        </div>

      ) : (

        <div className="dashboard-card report-placeholder-card no-print">

          <FileText
            size={32}
            className="teal-icon"
          />

          <h3>
            No Report Generated Yet
          </h3>

          <p>
            Click "Generate Report" above to build a formatted executive security audit.
          </p>

        </div>

      )}

    </div>
  );
}