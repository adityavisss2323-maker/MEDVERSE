/**
 * Authorization Service - Service Abstraction for User Authorization & Access Control
 */

const INITIAL_REQUESTS = [
  {
    id: "REQ-901",
    email: "dr.johnson@medverse.hospital",
    name: "Dr. Robert Johnson",
    role: "SOC Analyst",
    department: "Radiology",
    accessLevel: "Analyst",
    requestedAt: "2026-10-06 09:30:15",
    status: "Pending",
    expirationDate: "2026-12-31"
  },
  {
    id: "REQ-902",
    email: "sarah.admin@medverse.hospital",
    name: "Sarah Miller",
    role: "Security Administrator",
    department: "IT",
    accessLevel: "Administrator",
    requestedAt: "2026-10-05 14:22:10",
    status: "Approved",
    expirationDate: "2027-01-01"
  },
  {
    id: "REQ-903",
    email: "temp.contractor@medverse.hospital",
    name: "Alex Vance",
    role: "Incident Responder",
    department: "Emergency",
    accessLevel: "Investigator",
    requestedAt: "2026-10-01 11:10:00",
    status: "Revoked",
    expirationDate: "2026-10-05"
  },
  {
    id: "REQ-904",
    email: "auditor.davis@medverse.hospital",
    name: "Elena Davis",
    role: "Security Auditor",
    department: "Administration",
    accessLevel: "Read Only",
    requestedAt: "2026-09-15 08:45:00",
    status: "Expired",
    expirationDate: "2026-10-01"
  }
];

let mockRequests = [...INITIAL_REQUESTS];

export const authorizationService = {
  async getRequests() {
    await new Promise((res) => setTimeout(res, 400));
    return [...mockRequests];
  },

  async grantAccess({ userEmail, role, department, accessLevel, expirationDate }) {
    await new Promise((res) => setTimeout(res, 600));
    const newReq = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      email: userEmail,
      name: userEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      role: role || "SOC Analyst",
      department: department || "Cybersecurity",
      accessLevel: accessLevel || "Analyst",
      requestedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: "Approved",
      expirationDate: expirationDate || "2027-12-31"
    };

    mockRequests.unshift(newReq);
    return newReq;
  },

  async revokeAccess(requestId) {
    await new Promise((res) => setTimeout(res, 400));
    mockRequests = mockRequests.map((req) =>
      req.id === requestId ? { ...req, status: "Revoked" } : req
    );
    return { success: true };
  },

  async suspendAccess(requestId) {
    await new Promise((res) => setTimeout(res, 400));
    mockRequests = mockRequests.map((req) =>
      req.id === requestId ? { ...req, status: "Rejected" } : req
    );
    return { success: true };
  }
};
