export function StatusBadge({ status, type = "status" }) {
  const val = (status || "").toLowerCase();
  
  let badgeClass = "badge-neutral";
  let label = status;

  if (val === "normal" || val === "low" || val === "resolved" || val === "operational") {
    badgeClass = "badge-success";
  } else if (val === "suspicious" || val === "medium" || val === "investigating" || val === "monitoring" || val === "warning") {
    badgeClass = "badge-warning";
  } else if (val === "high" || val === "active") {
    badgeClass = "badge-orange";
  } else if (val === "critical" || val === "compromised") {
    badgeClass = "badge-danger";
  } else if (val === "quarantined") {
    badgeClass = "badge-quarantine";
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      <span className="badge-text">{label}</span>
    </span>
  );
}

export function SeverityBadge({ severity }) {
  return <StatusBadge status={severity} type="severity" />;
}
