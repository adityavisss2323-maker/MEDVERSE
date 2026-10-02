import { API_ENDPOINTS } from "./api";

export async function fetchAssets() {
  const response = await fetch(API_ENDPOINTS.ASSETS);
  const result = await response.json();
  if (!result.success)
    throw new Error(result.message || "Failed to fetch assets");
  return result.data;
}

export async function fetchAssetById(id) {
  const response = await fetch(`${API_ENDPOINTS.ASSETS}/${id}`);
  const result = await response.json();
  if (!result.success)
    throw new Error(result.message || "Failed to fetch asset");
  return result.data;
}

export async function fetchCyberDNAByAssetId(id) {
  const response = await fetch(`${API_ENDPOINTS.CYBER_DNA}/${id}`);
  const result = await response.json();
  if (!result.success)
    throw new Error(result.message || "Failed to fetch Cyber DNA");
  return result.data;
}
