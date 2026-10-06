/**
 * MED-VERSE Data Models and Type Definitions
 * Designed for enterprise healthcare SOC portal and frontend-backend decoupling.
 */

export const ROLES = {
  SOC_ANALYST: "SOC Analyst",
  SOC_LEAD: "SOC Lead Analyst",
  CISO: "CISO",
  SECURITY_ADMIN: "Security Administrator",
  IT_ADMIN: "Hospital IT Administrator",
  INCIDENT_RESPONDER: "Incident Responder",
  SECURITY_AUDITOR: "Security Auditor"
};

export const DEPARTMENTS = [
  "Emergency",
  "ICU",
  "Radiology",
  "Laboratory",
  "Pharmacy",
  "Administration",
  "IT",
  "Cybersecurity",
  "Other"
];

export const ACCESS_LEVELS = [
  "Read Only",
  "Analyst",
  "Investigator",
  "SOC Lead",
  "Administrator",
  "CISO"
];

export const AUTHORIZATION_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVOKED: "Revoked",
  EXPIRED: "Expired"
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "ar", name: "Arabic (العربية)" }
];
