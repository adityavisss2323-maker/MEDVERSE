/**
 * Central API Client Abstraction for MED-VERSE SOC Frontend.
 *
 * All frontend components use the API endpoint constants
 * instead of directly writing backend URLs.
 */

const API_BASE_URL = "http://localhost:5000";

const SIMULATE_DELAY_MS = 150;

export async function mockFetch(
  data,
  delay = SIMULATE_DELAY_MS
) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
}


/*
 * Backend API endpoints
 */
export const API_ENDPOINTS = {
    ASSETS: `${API_BASE_URL}/api/v1/assets`,
    ALERTS: `${API_BASE_URL}/api/v1/alerts`,
    INCIDENTS: `${API_BASE_URL}/api/v1/incidents`,
    FORENSICS: `${API_BASE_URL}/api/v1/forensic`,
    RESPONSES: `${API_BASE_URL}/api/v1/response`,
    THREAT_ANALYSIS: `${API_BASE_URL}/api/v1/threat-analysis`,
    CYBER_DNA: `${API_BASE_URL}/api/v1/cyber-dna`,
    RISK: `${API_BASE_URL}/api/v1/risk`,
    DIGITAL_TWIN: `${API_BASE_URL}/api/v1/digital-twin`,
    REPORTS: `${API_BASE_URL}/api/v1/reports`,
    ATTACK_PATHS: `${API_BASE_URL}/api/v1/attack-paths`,
    WHAT_IF: `${API_BASE_URL}/api/v1/what-if`
};