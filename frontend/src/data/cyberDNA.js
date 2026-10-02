export const cyberDNAProfiles = {
  "HIS-Server-02": {
    assetId: "HIS-Server-02",
    assetName: "HIS-Server-02",
    type: "Core Database & EHR",
    department: "Administration",
    deviationScore: 91, // percentage
    status: "critical",
    baseline: {
      loginPattern: "Scheduled API service accounts only (07:00 - 20:00). Zero interactive root sessions.",
      networkVolume: "Average 45 MB/min internal east-west traffic to EHR apps.",
      connectedSystems: ["DB-Server-01", "PACS-Server-01", "Pharmacy-Terminal-02"],
      processHash: "Verified RHEL Systemd Baseline v8.6",
    },
    currentBehavior: {
      loginPattern: "Unscheduled interactive root login at 04:12 AM from workstation 10.20.4.15.",
      networkVolume: "Spike to 1,200 MB/min outbound external streaming to unknown IP 185.220.101.5.",
      connectedSystems: ["DB-Server-01", "Doctor-PC-04", "External IP 185.220.101.5"],
      processHash: "Unsigned binary script /tmp/.enc_srv.sh executed.",
    },
    deviationReasons: [
      { id: "r1", label: "Unusual Login Time", severity: "High", detail: "Interactive root login executed outside 07:00-20:00 standard window." },
      { id: "r2", label: "Unknown External IP", severity: "Critical", detail: "Outbound SSL session established to unlisted remote IP 185.220.101.5." },
      { id: "r3", label: "Abnormal Traffic Volume", severity: "Critical", detail: "Bandwidth consumption exceeded normal baseline by 2,666%." },
      { id: "r4", label: "New Communication Pattern", severity: "High", detail: "First recorded direct connection from Emergency Workstation 04 to root console." },
    ],
  },
  "Doctor-PC-04": {
    assetId: "Doctor-PC-04",
    assetName: "Doctor-PC-04",
    type: "Workstation",
    department: "Emergency",
    deviationScore: 74,
    status: "suspicious",
    baseline: {
      loginPattern: "Emergency Physician single-sign-on (SSO) during shift hours.",
      networkVolume: "12 MB/min standard web & EHR gateway queries.",
      connectedSystems: ["Core-Switch-01"],
      processHash: "Standard Windows 11 Enterprise OS Build",
    },
    currentBehavior: {
      loginPattern: "Privilege escalation to Domain Admin account from local user session.",
      networkVolume: "140 MB/min scanning internal subnets.",
      connectedSystems: ["Core-Switch-01", "HIS-Server-02"],
      processHash: "Unverified process memory access on lsass.exe.",
    },
    deviationReasons: [
      { id: "r10", label: "Privilege Escalation", severity: "High", detail: "Local user session token swapped to Domain Admin credentials." },
      { id: "r11", label: "Unusual Server Connection", severity: "High", detail: "Initiated raw SMB connection to core database server." },
    ],
  },
  "ICU-IoMT-07": {
    assetId: "ICU-IoMT-07",
    assetName: "ICU-IoMT-07",
    type: "IoMT Medical Device",
    department: "ICU",
    deviationScore: 58,
    status: "suspicious",
    baseline: {
      loginPattern: "No interactive logins allowed. M2M telemetry push only.",
      networkVolume: "2.4 MB/min UDP broadcast to telemetry gateway.",
      connectedSystems: ["Telemetry Gateway 10.20.7.1"],
      processHash: "RTOS Firmware v4.2 Signed",
    },
    currentBehavior: {
      loginPattern: "No login changes.",
      networkVolume: "48 MB/min TCP SYN scanning.",
      connectedSystems: ["Core-Switch-01", "Adjacent IoMT devices"],
      processHash: "Firmware checksum intact; buffer memory spike detected.",
    },
    deviationReasons: [
      { id: "r20", label: "Port Scanning Activity", severity: "Medium", detail: "Sending unsolicited SYN packets to neighboring medical devices." },
    ],
  }
};
