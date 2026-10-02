import { API_ENDPOINTS } from "./api";

export async function fetchAlerts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.severity && filters.severity !== "All") {
    params.append('severity', filters.severity);
  }
  if (filters.department && filters.department !== "All") {
    params.append('department', filters.department);
  }
  if (filters.assetId) {
    params.append('assetId', filters.assetId);
  }
  
  const queryString = params.toString();
  const url = queryString ? `${API_ENDPOINTS.ALERTS}?${queryString}` : API_ENDPOINTS.ALERTS;
  
  const response = await fetch(url);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Failed to fetch alerts");
  return result.data;
}

export async function fetchAlertById(id) {
  const response = await fetch(`${API_ENDPOINTS.ALERTS}/${id}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Failed to fetch alert");
  return result.data;
}
