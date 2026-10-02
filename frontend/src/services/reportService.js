import { API_ENDPOINTS } from "./api";

export async function generateIncidentReportData({
  incident,
  language = "en"
}) {
  const incidentId = incident?.id;

  if (!incidentId) {
    throw new Error("Incident ID is required");
  }

  const response = await fetch(
    `${API_ENDPOINTS.REPORTS}/${incidentId}?language=${language}`
  );

  if (!response.ok) {
    throw new Error("Failed to generate incident report");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Failed to generate incident report"
    );
  }

  return result.data;
}