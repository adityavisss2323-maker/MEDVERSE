CREATE DATABASE med_verse;
USE med_verse;
SHOW DATABASES;
USE med_verse;
CREATE TABLE assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL UNIQUE,

    type VARCHAR(100) NOT NULL,

    ip_address VARCHAR(45),

    department VARCHAR(100),

    status ENUM(
        'Normal',
        'Suspicious',
        'Compromised',
        'Quarantined',
        'Offline'
    ) DEFAULT 'Normal',

    risk_level ENUM(
        'Low',
        'Medium',
        'High',
        'Critical'
    ) DEFAULT 'Low',

    criticality ENUM(
        'Low',
        'Medium',
        'High',
        'Critical'
    ) DEFAULT 'Medium',

    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);
SHOW TABLES;
DESCRIBE assets;
USE med_verse;

INSERT INTO assets
(
    name,
    type,
    ip_address,
    department,
    status,
    risk_level,
    criticality
)
VALUES
(
    'Doctor-PC-04',
    'Doctor PC',
    '192.168.10.24',
    'Cardiology',
    'Normal',
    'Low',
    'Medium'
);
SELECT * FROM assets;
USE med_verse;

CREATE TABLE security_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    event_type VARCHAR(50) NOT NULL,

    asset_id BIGINT UNSIGNED NOT NULL,

    source VARCHAR(50) NOT NULL,

    description TEXT NOT NULL,

    severity ENUM(
        'Low',
        'Medium',
        'High',
        'Critical'
    ) DEFAULT 'Low',

    source_ip VARCHAR(45),

    destination_ip VARCHAR(45),

    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_security_events_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
SHOW TABLES;
DESCRIBE security_events;
USE med_verse;

INSERT INTO security_events
(
    event_type,
    asset_id,
    source,
    description,
    severity,
    source_ip,
    destination_ip
)
VALUES
(
    'FAILED_LOGIN',
    1,
    'Active Directory',
    'Multiple failed authentication attempts detected',
    'High',
    '192.168.10.50',
    '192.168.10.24'
);
SELECT * FROM security_events;
SELECT
    se.id,
    se.event_type,
    se.severity,
    se.source,
    a.name AS asset_name,
    a.ip_address
FROM security_events se
JOIN assets a
    ON se.asset_id = a.id;
USE med_verse;

CREATE TABLE alerts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    alert_name VARCHAR(255) NOT NULL,

    alert_type VARCHAR(100) NOT NULL,

    asset_id BIGINT UNSIGNED NOT NULL,

    severity ENUM(
        'Low',
        'Medium',
        'High',
        'Critical'
    ) NOT NULL,

    status ENUM(
        'New',
        'Investigating',
        'Contained',
        'Resolved',
        'Closed'
    ) DEFAULT 'New',

    description TEXT NOT NULL,

    source_event_id BIGINT UNSIGNED NULL,

    confidence DECIMAL(5,2) DEFAULT 0,

    detection_reason JSON,

    potential_impact JSON,

    recommended_actions JSON,

    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_alerts_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_alerts_source_event
        FOREIGN KEY (source_event_id)
        REFERENCES security_events(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
SHOW TABLES;
DESCRIBE alerts;
USE med_verse;

INSERT INTO alerts
(
    alert_name,
    alert_type,
    asset_id,
    severity,
    status,
    description,
    source_event_id,
    confidence,
    detection_reason,
    potential_impact,
    recommended_actions
)
VALUES
(
    'Suspicious Login Activity',
    'Suspicious Authentication',
    1,
    'High',
    'New',
    'Multiple failed authentication attempts detected on Doctor-PC-04.',
    1,
    95,
    JSON_ARRAY(
        'Multiple failed login attempts detected',
        'Authentication pattern is unusual'
    ),
    JSON_ARRAY(
        'Possible account compromise',
        'Unauthorized access risk'
    ),
    JSON_ARRAY(
        'Investigate affected asset',
        'Review authentication logs',
        'Monitor related assets'
    )
);
SELECT * FROM alerts;
SELECT
    a.id AS alert_id,
    a.alert_name,
    a.alert_type,
    a.severity,
    a.status,

    ast.name AS asset_name,
    ast.ip_address,

    se.event_type,
    se.source AS event_source,
    se.source_ip

FROM alerts a

JOIN assets ast
    ON a.asset_id = ast.id

LEFT JOIN security_events se
    ON a.source_event_id = se.id;
USE med_verse;

CREATE TABLE incidents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    severity ENUM(
        'Low',
        'Medium',
        'High',
        'Critical'
    ) NOT NULL,

    status ENUM(
        'Open',
        'Investigating',
        'Contained',
        'Resolved',
        'Closed'
    ) DEFAULT 'Open',

    asset_id BIGINT UNSIGNED NOT NULL,

    threat_type VARCHAR(100),

    description TEXT,

    confidence DECIMAL(5,2) DEFAULT 0,

    impact JSON,

    recommended_actions JSON,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_incidents_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE incident_alerts (
    incident_id BIGINT UNSIGNED NOT NULL,

    alert_id BIGINT UNSIGNED NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (incident_id, alert_id),

    CONSTRAINT fk_incident_alerts_incident
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_incident_alerts_alert
        FOREIGN KEY (alert_id)
        REFERENCES alerts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
SHOW TABLES;
DESCRIBE incidents;
INSERT INTO incidents
(
    title,
    severity,
    status,
    asset_id,
    threat_type,
    description,
    confidence,
    impact,
    recommended_actions
)
VALUES
(
    'Suspicious Authentication Incident',
    'High',
    'Open',
    1,
    'Suspicious Authentication',
    'Incident created from repeated failed authentication attempts on Doctor-PC-04.',
    95,
    JSON_ARRAY(
        'Possible account compromise',
        'Unauthorized access risk'
    ),
    JSON_ARRAY(
        'Investigate affected asset',
        'Review authentication logs',
        'Monitor related assets'
    )
);
INSERT INTO incident_alerts
(
    incident_id,
    alert_id
)
VALUES
(
    1,
    1
);
SELECT
    i.id AS incident_id,
    i.title,
    i.severity,
    i.status,
    i.threat_type,
    a.id AS alert_id,
    a.alert_name,
    ast.name AS asset_name
FROM incidents i
JOIN incident_alerts ia
    ON i.id = ia.incident_id
JOIN alerts a
    ON ia.alert_id = a.id
JOIN assets ast
    ON i.asset_id = ast.id;
USE med_verse;

CREATE TABLE response_actions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    incident_id BIGINT UNSIGNED NOT NULL,

    asset_id BIGINT UNSIGNED NOT NULL,

    action_type VARCHAR(100) NOT NULL,

    action_title VARCHAR(255) NOT NULL,

    target VARCHAR(255),

    description TEXT,

    status ENUM(
        'Simulated',
        'Executed',
        'Failed'
    ) DEFAULT 'Simulated',

    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_response_actions_incident
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_response_actions_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
DESCRIBE response_actions;
SELECT *
FROM response_actions
ORDER BY id DESC;
SELECT *
FROM response_actions
ORDER BY id DESC;
SELECT * FROM response_actions
ORDER BY id DESC;
SELECT *
FROM response_actions
ORDER BY id DESC;
USE med_verse;
SELECT *
FROM response_actions
ORDER BY id DESC;
SELECT *
FROM response_actions
ORDER BY id DESC;