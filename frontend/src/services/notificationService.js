/**
 * Notification Service Abstraction
 */

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Critical Ransomware Alert",
    message: "Behavioral AI monitor detected file extension mutations on HIS-Server-02.",
    timestamp: "2 mins ago",
    type: "Critical Alert",
    severity: "critical",
    read: false,
    link: "/alerts"
  },
  {
    id: "notif-2",
    title: "New Authorization Request",
    message: "Dr. Robert Johnson requested SOC Analyst access for Radiology Wing.",
    timestamp: "15 mins ago",
    type: "Authorization Request",
    severity: "warning",
    read: false,
    link: "/authorization"
  },
  {
    id: "notif-3",
    title: "Unrecognized Device Login",
    message: "Login attempt approved from Windows / Chrome on IP 10.20.1.45.",
    timestamp: "1 hour ago",
    type: "New Login",
    severity: "info",
    read: true,
    link: "/profile?tab=devices"
  },
  {
    id: "notif-4",
    title: "MED-AI Threat Recommendation",
    message: "Recommended isolating PACS Storage Node-01 due to SMB scan activity.",
    timestamp: "2 hours ago",
    type: "AI Recommendation",
    severity: "warning",
    read: true,
    link: "/ai-analysis"
  }
];

let mockNotifications = [...INITIAL_NOTIFICATIONS];

export const notificationService = {
  async getNotifications() {
    await new Promise((res) => setTimeout(res, 300));
    return [...mockNotifications];
  },

  async markAsRead(id) {
    mockNotifications = mockNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    return [...mockNotifications];
  },

  async markAllAsRead() {
    mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    return [...mockNotifications];
  }
};
