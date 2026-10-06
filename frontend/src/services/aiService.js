/**
 * MED-VERSE AI (MED-AI) Cybersecurity Service Layer
 */

export const aiService = {
  async sendMessage({ message, context, language = "en" }) {
    await new Promise((res) => setTimeout(res, 800));

    const lower = message.toLowerCase();

    // Context-aware analysis responses
    if (context?.alert) {
      return {
        id: `msg_${Date.now()}`,
        sender: "ai",
        text: `### 🛡️ MED-AI Context Analysis: Alert ${context.alert.id || "Selected Alert"}\n\n**Severity:** ${context.alert.severity || "High"}\n**Source:** ${context.alert.source || "Behavioral AI Monitor"}\n\n#### Threat Overview\nWe detected anomalous encryption activity on **${context.alert.assetId || "HIS-Server-02"}**. High probability of ransomware staging behavior.\n\n#### Recommended Defensive Actions\n- Isolate target host from core medical subnet.\n- Capture memory dump for forensic sandbox analysis.\n- Revoke active service tokens on target device.`,
        recommendationCard: {
          title: `Isolate Compromised Asset (${context.alert.assetId || "HIS-Server-02"})`,
          actionType: "ISOLATE_ENDPOINT",
          assetId: context.alert.assetId || "HIS-Server-02",
          riskScore: 92,
          impact: "Isolates network traffic while preserving clinical telehealth data."
        }
      };
    }

    if (context?.incident) {
      return {
        id: `msg_${Date.now()}`,
        sender: "ai",
        text: `### 🏥 Incident Containment Brief: ${context.incident.id || "INC-204"}\n\n**Title:** ${context.incident.title || "Unusual Medical Device Outbound Traffic"}\n\n#### Root Cause Analysis\nLateral movement detected via compromised VPN gateway attempting SMB relay against ICU ventilator VLAN.\n\n#### Defensive Mitigation Steps\n1. Enforce strict microsegmentation rule on Firewalls.\n2. Trigger immediate credential rotation for IT Admin accounts.`,
        recommendationCard: {
          title: "Block Malicious Lateral IP (10.20.4.102)",
          actionType: "BLOCK_IP",
          ip: "10.20.4.102",
          riskScore: 88,
          impact: "Blocks malicious lateral connection attempts to ICU IoMT network."
        }
      };
    }

    if (lower.includes("isolate") || lower.includes("endpoint") || lower.includes("contain")) {
      return {
        id: `msg_${Date.now()}`,
        sender: "ai",
        text: `### 🛡️ Containment Analysis Request\n\nI have evaluated the endpoint security parameters for hospital host **HIS-Server-02** (10.20.1.22).\n\n**Recommendation:** Network isolation is advisable to prevent encryption propagation across radiology and EHR subnets.`,
        recommendationCard: {
          title: "Isolate HIS-Server-02 Immediately",
          actionType: "ISOLATE_ENDPOINT",
          assetId: "HIS-Server-02",
          riskScore: 95,
          impact: "Immediately severs outbound C2 connection."
        }
      };
    }

    // Default intelligent response
    return {
      id: `msg_${Date.now()}`,
      sender: "ai",
      text: `### 🏥 MED-AI Security Analysis\n\nI have reviewed your query against current hospital cybersecurity telemetry:\n\n1. **Zero Trust Status:** Active on all 14 clinical subnets.\n2. **Threat Matrix:** No uncontained lateral movement detected in the past 15 minutes.\n3. **Compliance Audit:** Role-Based Access Controls enforced.\n\nHow else can I assist your SOC investigation?`
    };
  },

  async analyzeFile(file) {
    await new Promise((res) => setTimeout(res, 1200));

    return {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileType: file.type || "Security Artifact",
      executiveSummary: `Analyzed security artifact ${file.name}. Found 3 potential Indicators of Compromise (IoCs) associated with known healthcare phishing vectors.`,
      keyFindings: [
        "Suspicious PowerShell execution string detected in header section.",
        "Attempted outbound connection to unverified external IP (185.220.101.5).",
        "No active clinical database modifications observed."
      ],
      securityRisks: [
        { risk: "Credential Dumping Attempt", severity: "High" },
        { risk: "Unauthorized Network Reconnaissance", severity: "Medium" }
      ],
      indicatorsOfCompromise: [
        "185.220.101.5 (C2 IP)",
        "SHA256: 4f8b91a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
      ],
      recommendations: [
        "Add IP 185.220.101.5 to perimeter firewall drop rules.",
        "Initiate endpoint scan on source machine."
      ],
      severity: "High",
      confidence: 94
    };
  },

  async analyzeImage(imageFile) {
    await new Promise((res) => setTimeout(res, 1100));

    return {
      imageName: imageFile.name,
      detectedInformation: "Captured screenshot shows an unauthorized privilege escalation prompt and abnormal CPU spike on PACS server.",
      potentialRisks: [
        "Unauthenticated admin login pop-up",
        "PACS Storage Service process suspended"
      ],
      recommendations: [
        "Verify active administrator logins in SOC Audit Log.",
        "Re-authenticate DICOM storage node credentials."
      ],
      severity: "Medium"
    };
  },

  async executeDefensiveAction(action) {
    await new Promise((res) => setTimeout(res, 900));
    return {
      success: true,
      executionId: `EXEC-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Executed & Verified",
      timestamp: new Date().toISOString(),
      actionType: action.actionType || "DEFENSIVE_ACTION",
      message: `Defensive action '${action.title}' successfully dispatched to hospital firewall controller.`
    };
  }
};
