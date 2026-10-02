import { responseActionsList } from "../data/responses";
import { API_ENDPOINTS } from "./api";

export async function fetchResponseActions() {
  return new Promise(resolve => setTimeout(() => resolve(responseActionsList), 150));
}

export async function fetchResponseHistory() {
  const response = await fetch(API_ENDPOINTS.RESPONSES);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Failed to fetch response history");
  return result.data;
}

export async function executeSimulatedResponse({ actionId, actionName, targetAsset, notes }) {
  const response = await fetch(`${API_ENDPOINTS.RESPONSES}/${targetAsset}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: actionName, notes })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.message || "Failed to execute response");
  return result;
}
