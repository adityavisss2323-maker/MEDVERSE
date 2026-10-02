import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../services/api";
import {
    Activity,
    AlertTriangle,
    Server,
    ShieldCheck,
    ShieldAlert,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Radio,
    Maximize2,
    X,
    Eye,
    Clock3,
    Network,
} from "lucide-react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const threatData = [
    { time: "08:00", alerts: 8 },
    { time: "09:00", alerts: 12 },
    { time: "10:00", alerts: 10 },
    { time: "11:00", alerts: 18 },
    { time: "12:00", alerts: 14 },
    { time: "13:00", alerts: 26 },
    { time: "14:00", alerts: 21 },
    { time: "15:00", alerts: 34 },
    { time: "16:00", alerts: 28 },
    { time: "17:00", alerts: 19 },
];

const initialEvents = [
    {
        id: 1,
        type: "Ransomware Behavior",
        asset: "HIS-Server-02",
        severity: "Critical",
        time: "2 min ago",
    },
    {
        id: 2,
        type: "Failed Authentication",
        asset: "Doctor-PC-04",
        severity: "Medium",
        time: "4 min ago",
    },
    {
        id: 3,
        type: "Port Scan Detected",
        asset: "ICU-IoMT-07",
        severity: "High",
        time: "7 min ago",
    },
    {
        id: 4,
        type: "Unknown Device",
        asset: "Radiology-Network",
        severity: "High",
        time: "11 min ago",
    },
];

const incidents = [
    {
        id: "INC-1042",
        title: "Possible Ransomware Activity",
        asset: "HIS-Server-02",
        severity: "Critical",
        status: "Investigating",
    },
    {
        id: "INC-1041",
        title: "Lateral Movement Detected",
        asset: "Doctor-PC-04",
        severity: "High",
        status: "Active",
    },
    {
        id: "INC-1039",
        title: "Unauthorized IoMT Device",
        asset: "ICU-IoMT-07",
        severity: "Medium",
        status: "Monitoring",
    },
];

const assets = [
    {
        id: "HIS-Server-02",
        type: "Hospital Information System",
        department: "Administration",
        ip: "10.20.1.22",
        status: "compromised",
        risk: "critical",
    },
    {
        id: "Doctor-PC-04",
        type: "Workstation",
        department: "Emergency",
        ip: "10.20.4.15",
        status: "suspicious",
        risk: "high",
    },
    {
        id: "ICU-IoMT-07",
        type: "IoMT Device",
        department: "ICU",
        ip: "10.20.7.42",
        status: "suspicious",
        risk: "medium",
    },
    {
        id: "PACS-Server-01",
        type: "PACS Server",
        department: "Radiology",
        ip: "10.20.8.10",
        status: "normal",
        risk: "low",
    },
];

function Dashboard() {
    const [focusMode, setFocusMode] = useState(false);
    const [liveMode, setLiveMode] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [events, setEvents] = useState(initialEvents);
        const [liveAssets, setLiveAssets] = useState([]);
    const [liveAlerts, setLiveAlerts] = useState([]);
    const [liveIncidents, setLiveIncidents] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

        useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoadingDashboard(true);

                const [
                    assetsResponse,
                    alertsResponse,
                    incidentsResponse
                ] = await Promise.all([
                    fetch(API_ENDPOINTS.ASSETS),
                    fetch(API_ENDPOINTS.ALERTS),
                    fetch(API_ENDPOINTS.INCIDENTS)
                ]);

                if (
                    !assetsResponse.ok ||
                    !alertsResponse.ok ||
                    !incidentsResponse.ok
                ) {
                    throw new Error("Failed to fetch dashboard data");
                }

                const assetsJson = await assetsResponse.json();
                const alertsJson = await alertsResponse.json();
                const incidentsJson = await incidentsResponse.json();

                setLiveAssets(assetsJson.data || []);
                setLiveAlerts(alertsJson.data || []);
                setLiveIncidents(incidentsJson.data || []);

            } catch (error) {
                console.error(
                    "Dashboard API Error:",
                    error
                );
            } finally {
                setLoadingDashboard(false);
            }
        };

        loadDashboardData();
    }, []);

        const activeAlerts = liveAlerts.filter(
        (alert) =>
            alert.status === "Active" ||
            alert.status === "Investigating"
    );

    const criticalAlerts = liveAlerts.filter(
        (alert) =>
            alert.severity === "Critical"
    );

    const activeIncidents = liveIncidents.filter(
        (incident) =>
            incident.status === "Open" ||
            incident.status === "Investigating" ||
            incident.status === "Contained"
    );

    const compromisedAssets = liveAssets.filter(
        (asset) =>
            asset.status === "compromised"
    );

    const normalAssets = liveAssets.filter(
        (asset) =>
            asset.status === "normal"
    );

    const suspiciousAssets = liveAssets.filter(
        (asset) =>
            asset.status === "suspicious"
    );

    const liveEvents = liveAlerts.map(
        (alert) => ({
            id: alert.id,
            type: alert.title,
            asset: alert.assetName,
            severity: alert.severity,
            time: alert.timestamp
        })
    );

    const dashboardEvents =
        liveEvents.length > 0
            ? liveEvents
            : events;

        const interval = setInterval(() => {
            setEvents((current) => [
                {
                    id: Date.now(),
                    type: "Live Network Activity",
                    asset: "Core-Switch-01",
                    severity: "Medium",
                    time: "just now",
                },
                ...current,
            ].slice(0, 5));
        }, 6000);

        return () => clearInterval(interval);
    }, [liveMode]);

    const visibleEvents = focusMode
        ? dashboardEvents.filter((event) => event.severity === "Critical")
        : dashboardEvents;

    return (
        <div className="soc-dashboard">

            {/* HEADER */}
            <div className="dashboard-header">

                <div>
                    <p className="eyebrow">SECURITY OPERATIONS CENTER</p>

                    <h1>Security Overview</h1>

                    <p className="page-description">
                        Real-time cybersecurity monitoring across the hospital environment.
                    </p>
                </div>

                <div className="dashboard-controls">

                    <button
                        className={`control-button ${liveMode ? "control-active" : ""}`}
                        onClick={() => setLiveMode(!liveMode)}
                    >
                        <Radio size={16} />

                        {liveMode ? "Live SOC On" : "Live SOC"}
                    </button>

                    <button
                        className={`control-button ${focusMode ? "control-active" : ""}`}
                        onClick={() => setFocusMode(!focusMode)}
                    >
                        <Eye size={16} />

                        {focusMode ? "Critical Only" : "Focus Mode"}
                    </button>

                </div>
            </div>


            {/* SECURITY POSTURE */}
            <div className="security-posture">

                <div className="posture-left">

                    <div className="posture-icon">
                        <ShieldCheck size={24} />
                    </div>

                    <div>
                        <span>Security Posture</span>

                        <strong>Attention Required</strong>

                        <p>
                            {criticalAlerts.length} critical security events require investigation.
                        </p>
                    </div>

                </div>

                <div className="posture-status">
                    <span className="status-pulse"></span>
                    SOC Monitoring Active
                </div>

            </div>


            {/* KPI CARDS */}
            <div className="kpi-grid">

                <KpiCard
                    icon={<Server size={20} />}
                    label="Protected Assets"
                    value={liveAssets.length}
                    change="+4.2%"
                    positive
                    description="assets monitored"
                />

                <KpiCard
                    icon={<ShieldAlert size={20} />}
                    label="Active Alerts"
                    value={activeAlerts.length}
                    change="+8.1%"
                    description="last 24 hours"
                />

                <KpiCard
                    icon={<AlertTriangle size={20} />}
                    label="Critical Threats"
                    value={criticalAlerts.length}
                    change="+2"
                    description="requires attention"
                    critical
                />

                <KpiCard
                    icon={<Activity size={20} />}
                    label="Compromised"
                    value={compromisedAssets.length}
                    change="-1"
                    positive
                    description="assets affected"
                />

                <KpiCard
                    icon={<Users size={20} />}
                    label="Active Incidents"
                    value={activeIncidents.length}
                    change="+1"
                    description="under investigation"
                />

            </div>


            {/* MAIN GRID */}
            <div className="dashboard-grid">

                {/* THREAT ACTIVITY */}
                <section className="dashboard-card threat-chart-card">

                    <CardHeader
                        title="Threat Activity"
                        subtitle="Security events over the last 10 hours"
                        icon={<Activity size={18} />}
                    />

                    <div className="chart-container">

                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={threatData}
                                onClick={(data) => {
                                    if (data?.activePayload?.length) {
                                        setSelectedHour(data.activePayload[0].payload);
                                    }
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e8edf2"
                                />

                                <XAxis
                                    dataKey="time"
                                    tick={{
                                        fontSize: 10,
                                        fill: "#8793a3",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    tick={{
                                        fontSize: 10,
                                        fill: "#8793a3",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip
                                    contentStyle={{
                                        border: "1px solid #e3e8ee",
                                        borderRadius: "8px",
                                        fontSize: "11px",
                                    }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="alerts"
                                    stroke="#176b87"
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 3,
                                        fill: "#176b87",
                                    }}
                                    activeDot={{
                                        r: 6,
                                    }}
                                />

                            </LineChart>
                        </ResponsiveContainer>

                    </div>

                    {selectedHour && (
                        <div className="chart-selection">

                            <div>
                                <strong>{selectedHour.time}</strong>

                                <span>
                                    {selectedHour.alerts} security events detected
                                </span>
                            </div>

                            <button
                                onClick={() => setSelectedHour(null)}
                            >
                                <X size={15} />
                            </button>

                        </div>
                    )}

                </section>


                {/* ACTIVE INCIDENTS */}
                <section className="dashboard-card">

                    <CardHeader
                        title="Active Incidents"
                        subtitle="Requires analyst attention"
                        icon={<AlertTriangle size={18} />}
                    />

                    <div className="incident-list">

                        {(liveIncidents.length > 0
    ? liveIncidents
    : incidents
).map((incident) => (

                            <button
                                className="incident-row"
                                key={incident.id}
                                onClick={() => setSelectedIncident(incident)}
                            >

                                <div className={`severity-bar ${incident.severity.toLowerCase()}`}></div>

                                <div className="incident-content">

                                    <div className="incident-top">

                                        <span className="incident-id">
                                            {incident.id}
                                        </span>

                                        <SeverityBadge severity={incident.severity} />

                                    </div>

                                    <strong>{incident.title}</strong>

                                    <span className="incident-asset">
                                        {incident.assetName || incident.asset}
                                    </span>

                                </div>

                                <ArrowUpRight size={16} />

                            </button>

                        ))}

                    </div>

                </section>


                {/* ASSET HEALTH */}
                <section className="dashboard-card">

                    <CardHeader
                        title="Asset Health"
                        subtitle="Current infrastructure status"
                        icon={<Server size={18} />}
                    />

                    <div className="asset-health">

                        <HealthBar
                            label="Normal"
                            value={liveAssets.length ? Math.round((normalAssets.length / liveAssets.length) * 100) : 0}
                            className="normal"
                        />

                        <HealthBar
                            label="Suspicious"
                            value={liveAssets.length ? Math.round((suspiciousAssets.length / liveAssets.length) * 100) : 0}
                            className="suspicious"
                        />

                        <HealthBar
                            label="Compromised"
                            value={liveAssets.length ? Math.round((compromisedAssets.length / liveAssets.length) * 100) : 0}
                            className="compromised"
                        />

                    </div>

                    <div className="health-summary">

                        <div>
                            <strong>{liveAssets.length}</strong>
                            <span>Total assets</span>
                        </div>

                        <div>
                            <strong>{normalAssets.length}</strong>
                            <span>Healthy</span>
                        </div>

                        <div>
                            <strong>{suspiciousAssets.length}</strong>
                            <span>Suspicious</span>
                        </div>

                    </div>

                </section>


                {/* MINI DIGITAL TWIN */}
                <section className="dashboard-card twin-card">

                    <CardHeader
                        title="Hospital Digital Twin"
                        subtitle="Live infrastructure overview"
                        icon={<Network size={18} />}
                        action="Open Twin"
                    />

                    <div className="mini-twin">

                        <div className="twin-node core">
                            <div className="node-circle">
                                <Network size={18} />
                            </div>

                            <span>Core Network</span>
                        </div>


                        <div className="twin-line line-one"></div>
                        <div className="twin-line line-two"></div>
                        <div className="twin-line line-three"></div>


                        <TwinNode
                            name={liveAssets[0]?.name || "HIS-02"}
                            status={liveAssets[0]?.status || "compromised"}
                            onClick={() => setSelectedAsset(liveAssets[0] || assets[0])}
                        />

                        <TwinNode
                            name={liveAssets[1]?.name || "Doctor-PC"}
                            status={liveAssets[1]?.status || "suspicious"}
                            onClick={() => setSelectedAsset(liveAssets[1] || assets[1])}
                        />

                        <TwinNode
                            name={liveAssets[2]?.name || "ICU-IoMT"}
                            status={liveAssets[2]?.status || "suspicious"}
                            onClick={() => setSelectedAsset(liveAssets[2] || assets[2])}
                        />

                    </div>

                    <div className="twin-legend">

                        <span>
                            <i className="legend normal"></i>
                            Normal
                        </span>

                        <span>
                            <i className="legend suspicious"></i>
                            Suspicious
                        </span>

                        <span>
                            <i className="legend compromised"></i>
                            Compromised
                        </span>

                    </div>

                </section>


                {/* LIVE EVENTS */}
                <section className="dashboard-card events-card">

                    <CardHeader
                        title="Live Security Events"
                        subtitle={
                            liveMode
                                ? "Receiving simulated telemetry"
                                : "Latest detected activity"
                        }
                        icon={<Clock3 size={18} />}
                    />

                    <div className="event-list">

                        {visibleEvents.length === 0 ? (

                            <div className="empty-state">
                                No critical events.
                            </div>

                        ) : (

                            visibleEvents.map((event) => (

                                <div
                                    className="event-row"
                                    key={event.id}
                                >

                                    <div
                                        className={`event-icon ${event.severity.toLowerCase()}`}
                                    >
                                        <ShieldAlert size={15} />
                                    </div>

                                    <div className="event-details">

                                        <strong>{event.type}</strong>

                                        <span>{event.asset}</span>

                                    </div>

                                    <div className="event-meta">

                                        <SeverityBadge severity={event.severity} />

                                        <small>{event.time}</small>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </section>

            </div>


            {/* ASSET MODAL */}
            {selectedAsset && (

                <Modal
                    title="Asset Investigation"
                    onClose={() => setSelectedAsset(null)}
                >

                    <div className="investigation-header">

                        <div className={`large-asset-status ${selectedAsset.status}`}>
                            <Server size={24} />
                        </div>

                        <div>
                            <h3>{selectedAsset.id}</h3>
                            <p>{selectedAsset.type}</p>
                        </div>

                    </div>

                    <div className="detail-grid">

                        <Detail label="Department" value={selectedAsset.department} />

                        <Detail label="IP Address" value={selectedAsset.ip} />

                        <Detail
                            label="Current Status"
                            value={selectedAsset.status}
                        />

                        <Detail
                            label="Risk Level"
                            value={selectedAsset.risk}
                        />

                    </div>

                    <div className="modal-section">

                        <h4>Recommended Investigation</h4>

                        <p>
                            Review recent alerts, network relationships, AI evidence
                            and forensic activity associated with this asset.
                        </p>

                    </div>

                    <div className="modal-actions">

                        <button className="secondary-button">
                            View Alerts
                        </button>

                        <button className="primary-button">
                            Open Digital Twin
                        </button>

                    </div>

                </Modal>

            )}


            {/* INCIDENT MODAL */}
            {selectedIncident && (

                <Modal
                    title="Incident Overview"
                    onClose={() => setSelectedIncident(null)}
                >

                    <div className="incident-modal">

                        <div className="incident-modal-title">

                            <div>
                                <span>{selectedIncident.id}</span>

                                <h3>{selectedIncident.title}</h3>
                            </div>

                            <SeverityBadge
                                severity={selectedIncident.severity}
                            />

                        </div>

                        <div className="detail-grid">

                            <Detail
                                label="Affected Asset"
                                value={selectedIncident.assetName || selectedIncident.asset}
                            />

                            <Detail
                                label="Severity"
                                value={selectedIncident.severity}
                            />

                            <Detail
                                label="Status"
                                value={selectedIncident.status}
                            />

                            <Detail
                                label="Detection"
                                value="AI-assisted analysis"
                            />

                        </div>

                        <div className="modal-section">

                            <h4>Investigation Flow</h4>

                            <div className="investigation-flow">

                                <span>Alert</span>
                                <b>→</b>
                                <span>AI Analysis</span>
                                <b>→</b>
                                <span>Attack Path</span>
                                <b>→</b>
                                <span>Response</span>

                            </div>

                        </div>

                        <div className="modal-actions">

                            <button className="secondary-button">
                                View Evidence
                            </button>

                            <button className="primary-button">
                                Investigate Incident
                            </button>

                        </div>

                    </div>

                </Modal>

            )}

        </div>
    );
}


/* =========================
   COMPONENTS
========================= */

function KpiCard({
    icon,
    label,
    value,
    change,
    positive,
    critical,
    description,
}) {
    return (
        <div className={`kpi-card ${critical ? "kpi-critical" : ""}`}>

            <div className="kpi-top">

                <div className="kpi-icon">
                    {icon}
                </div>

                <span
                    className={`kpi-change ${positive ? "positive" : "negative"
                        }`}
                >
                    {positive ? (
                        <ArrowDownRight size={13} />
                    ) : (
                        <ArrowUpRight size={13} />
                    )}

                    {change}
                </span>

            </div>

            <strong>{value}</strong>

            <div className="kpi-label">
                {label}
            </div>

            <span className="kpi-description">
                {description}
            </span>

        </div>
    );
}


function CardHeader({
    title,
    subtitle,
    icon,
    action,
}) {
    return (
        <div className="card-header">

            <div className="card-title-group">

                <div className="card-icon">
                    {icon}
                </div>

                <div>
                    <h3>{title}</h3>
                    <span>{subtitle}</span>
                </div>

            </div>

            {action && (
                <button className="card-action">
                    {action}
                </button>
            )}

        </div>
    );
}


function SeverityBadge({ severity }) {
    return (
        <span className={`severity-badge ${severity.toLowerCase()}`}>
            {severity}
        </span>
    );
}


function HealthBar({ label, value, className }) {
    return (
        <div className="health-row">

            <div className="health-label">
                <span>{label}</span>
                <strong>{value}%</strong>
            </div>

            <div className="health-track">
                <div
                    className={`health-fill ${className}`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>

        </div>
    );
}


function TwinNode({ name, status, onClick }) {
    return (
        <button
            className={`twin-node ${status}`}
            onClick={onClick}
        >
            <span className="twin-status"></span>
            <span>{name}</span>
        </button>
    );
}


function Modal({ title, onClose, children }) {
    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">

                    <h2>{title}</h2>

                    <button
                        className="modal-close"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="modal-body">
                    {children}
                </div>

            </div>

        </div>
    );
}


function Detail({ label, value }) {
    return (
        <div className="detail-item">

            <span>{label}</span>

            <strong>{value}</strong>

        </div>
    );
}

export default Dashboard;