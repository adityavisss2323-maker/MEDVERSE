export const responseActionsList = [
  {
    id: "act-isolate",
    name: "Isolate Device",
    category: "Network Defense",
    impact: "High",
    description: "Simulate cutting off network interfaces for the selected asset while preserving SOC monitoring agent connectivity.",
    simulatedEffect: "Device will be marked as QUARANTINED in Digital Twin and threat traffic will drop to zero.",
    requiresConfirmation: true,
  },
  {
    id: "act-block-conn",
    name: "Block Connection",
    category: "Traffic Control",
    impact: "Medium",
    description: "Simulate inserting a firewall rule blocking traffic between target asset and specific external or internal IP addresses.",
    simulatedEffect: "Specific IP route set to BLOCKED in Firewall Table.",
    requiresConfirmation: true,
  },
  {
    id: "act-disable-acct",
    name: "Disable Account",
    category: "Identity Protection",
    impact: "Medium",
    description: "Simulate deactivating compromised Active Directory or local administrator user credentials.",
    simulatedEffect: "User account state updated to DISABLED in Auth Gateway.",
    requiresConfirmation: true,
  },
  {
    id: "act-reset-cred",
    name: "Reset Credential",
    category: "Identity Protection",
    impact: "Low",
    description: "Simulate forcing password revocation and MFA token re-issuance for affected users.",
    simulatedEffect: "Temporary password generated and forced change flag set.",
    requiresConfirmation: false,
  },
  {
    id: "act-collect-evid",
    name: "Collect Forensic Evidence",
    category: "Investigation",
    impact: "Low",
    description: "Simulate taking volatile RAM snapshot and disk artifact archive for deep forensic analysis.",
    simulatedEffect: "Memory dump saved to Forensic Vault /vault/forensics/tar.gz.",
    requiresConfirmation: false,
  },
  {
    id: "act-escalate",
    name: "Escalate Incident",
    category: "Management",
    impact: "Low",
    description: "Escalate incident to Tier 3 SOC Lead and Hospital CISO emergency response roster.",
    simulatedEffect: "Emergency notification broadcast sent to CISO paging desk.",
    requiresConfirmation: false,
  }
];

export const initialResponseHistory = [
  {
    id: "RH-501",
    timestamp: "09:04 AM Today",
    actionName: "Isolate Device",
    targetAsset: "HIS-Server-02",
    initiatedBy: "SOC Analyst (Simulated)",
    status: "Completed",
    notes: "Automated simulation quarantine applied following ransomware behavioral alert ALT-9041.",
  },
  {
    id: "RH-500",
    timestamp: "08:55 AM Today",
    actionName: "Reset Credential",
    targetAsset: "Doctor-PC-04",
    initiatedBy: "SOC Analyst",
    status: "Completed",
    notes: "Revoked active Kerberos ticket for Domain\\Admin account on Emergency Workstation.",
  }
];
