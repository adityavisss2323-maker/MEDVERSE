# MED-VERSE Frontend & Backend Integration Guide

This document details how backend engineers can seamlessly connect real REST APIs and WebSockets to the MED-VERSE frontend.

---

## 1. Architecture Overview

The MED-VERSE frontend is architected with complete separation of concerns:
- **UI Components** (`src/pages/*` and `src/components/*`) consume data via **Service Modules** (`src/services/*`).
- Components **never** call hardcoded mock arrays directly.
- To connect your backend REST API, simply update the resolver functions inside `src/services/api.js` and individual service files (`assetService.js`, `alertService.js`, `incidentService.js`, `responseService.js`, `reportService.js`).

---

## 2. API Service Locations

| Domain | Service File | Key Methods | Backend Endpoint |
|---|---|---|---|
| **Assets** | `src/services/assetService.js` | `fetchAssets()`, `fetchAssetById()`, `fetchCyberDNAByAssetId()` | `GET /api/v1/assets` |
| **Alerts** | `src/services/alertService.js` | `fetchAlerts(filters)`, `fetchAlertById()` | `GET /api/v1/alerts` |
| **Incidents** | `src/services/incidentService.js` | `fetchIncidents()`, `fetchIncidentById()`, `fetchAttackPathByIncidentId()` | `GET /api/v1/incidents` |
| **Response** | `src/services/responseService.js` | `fetchResponseActions()`, `executeSimulatedResponse()` | `POST /api/v1/responses/execute` |
| **Reports** | `src/services/reportService.js` | `generateIncidentReportData()` | `POST /api/v1/reports/generate` |

---

## 3. Data Schemas

### Asset Schema
```json
{
  "id": "HIS-Server-02",
  "name": "Hospital Information System 02",
  "type": "Core Database & EHR",
  "department": "Administration",
  "departmentId": "dept-admin",
  "ip": "10.20.1.22",
  "mac": "00:1A:2B:3C:4D:5E",
  "status": "compromised",
  "risk": "critical",
  "criticalityScore": 98,
  "lastSeen": "1 min ago",
  "location": "Server Room B",
  "connections": ["DB-Server-01", "Doctor-PC-04"],
  "cyberDNADeviation": 91
}
```

### Alert Schema
```json
{
  "id": "ALT-9041",
  "severity": "Critical",
  "title": "Ransomware Encryption Pattern Detected",
  "assetId": "HIS-Server-02",
  "department": "Administration",
  "source": "Behavioral AI Monitor",
  "timestamp": "09:01:14",
  "status": "Active",
  "confidence": 94,
  "evidence": "Rapid sequential file extension mutations detected."
}
```

---

## 4. WebSocket Live Telemetry Integration

For live telemetry updates:
- Hook into `src/context/SOCContext.jsx`.
- Replace the `setInterval` simulator with a WebSocket connection (`ws://<backend-host>/ws/telemetry`).
- Dispatch incoming websocket telemetry messages to `setAlertList` and `setAssetList`.
