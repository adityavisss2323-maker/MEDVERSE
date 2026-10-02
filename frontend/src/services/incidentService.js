import { API_ENDPOINTS } from "./api";

export async function fetchIncidents() {
  const response = await fetch(API_ENDPOINTS.INCIDENTS);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Failed to fetch incidents");
  return result.data;
}

export async function fetchIncidentById(id) {
  const response = await fetch(`${API_ENDPOINTS.INCIDENTS}/${id}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Failed to fetch incident");
  return result.data;
}

export async function fetchAttackPathByIncidentId(incidentId) {
  const response = await fetch(`${API_ENDPOINTS.ATTACK_PATHS}/${incidentId}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Failed to fetch attack path");
  return result.data;
}
