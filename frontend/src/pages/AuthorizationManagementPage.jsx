import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Mail,
  Building,
  Shield,
  Calendar,
  KeyRound,
  X,
  AlertCircle
} from "lucide-react";
import { authorizationService } from "../services/authorizationService";
import { usePermissions } from "../hooks/usePermissions";
import { ROLES, DEPARTMENTS, ACCESS_LEVELS } from "../types";
import { OTPModal } from "../components/auth/OTPModal";

export default function AuthorizationManagementPage() {
  const { isManagementAuthorized, role } = usePermissions();

  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending"); // Pending | Approved | Revoked | Expired
  const [searchQuery, setSearchQuery] = useState("");

  // Grant Access Modal State
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState(ROLES.SOC_ANALYST);
  const [selectedDepartment, setSelectedDepartment] = useState("Cybersecurity");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("Analyst");
  const [expirationDate, setExpirationDate] = useState("2027-12-31");

  // OTP Confirmation Step
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [pendingGrantData, setPendingGrantData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await authorizationService.getRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isManagementAuthorized()) {
    return (
      <div className="unauthorized-page-banner">
        <ShieldCheck size={40} className="text-warning" />
        <h2>Access Restricted</h2>
        <p>
          Authorization Management requires administrative privileges (CISO, SOC Lead, or Security Administrator).
        </p>
      </div>
    );
  }

  const filteredRequests = requests.filter((req) => {
    const matchesTab = req.status === activeTab;
    const matchesSearch =
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleInitiateGrant = (e) => {
    e.preventDefault();
    if (!userEmail) return;

    setPendingGrantData({
      userEmail,
      role: selectedRole,
      department: selectedDepartment,
      accessLevel: selectedAccessLevel,
      expirationDate
    });

    setIsGrantModalOpen(false);
    setIsOTPModalOpen(true);
  };

  const handleConfirmGrantWithOTP = async () => {
    if (!pendingGrantData) return;
    try {
      await authorizationService.grantAccess(pendingGrantData);
      loadRequests();
      setUserEmail("");
      setPendingGrantData(null);
    } catch (err) {
      alert("Failed to grant access.");
    }
  };

  const handleRevoke = async (id) => {
    if (confirm("Are you sure you want to revoke authorization for this user?")) {
      await authorizationService.revokeAccess(id);
      loadRequests();
    }
  };

  const handleSuspend = async (id) => {
    if (confirm("Are you sure you want to suspend this authorization request?")) {
      await authorizationService.suspendAccess(id);
      loadRequests();
    }
  };

  return (
    <div className="auth-mgmt-container">
      {/* PAGE HEADER */}
      <div className="auth-mgmt-header">
        <div>
          <h2>User Authorization & Access Control</h2>
          <p className="subtitle">
            Enterprise RBAC clearance portal for hospital SOC operations.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsGrantModalOpen(true)}
        >
          <UserPlus size={16} />
          <span>Grant Access</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="mgmt-controls-bar">
        <div className="mgmt-tabs">
          {["Pending", "Approved", "Revoked", "Expired"].map((tab) => {
            const count = requests.filter((r) => r.status === tab).length;
            return (
              <button
                key={tab}
                className={`mgmt-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <span>{tab} Requests</span>
                <span className="count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search email, name, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* REQUESTS TABLE */}
      <div className="table-card">
        {isLoading ? (
          <div className="table-loading-state">Loading authorization data...</div>
        ) : (
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>User / Email</th>
                <th>Requested Role</th>
                <th>Department</th>
                <th>Access Level</th>
                <th>Requested Date</th>
                <th>Expiration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="user-cell">
                        <strong>{req.name}</strong>
                        <small>{req.email}</small>
                      </div>
                    </td>
                    <td><span className="role-chip">{req.role}</span></td>
                    <td>{req.department}</td>
                    <td><strong>{req.accessLevel}</strong></td>
                    <td><code>{req.requestedAt}</code></td>
                    <td><code>{req.expirationDate}</code></td>
                    <td>
                      <span className={`status-badge ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-actions-row">
                        {req.status === "Pending" && (
                          <button
                            className="btn-action grant"
                            onClick={() => {
                              setUserEmail(req.email);
                              setSelectedRole(req.role);
                              setSelectedDepartment(req.department);
                              setIsGrantModalOpen(true);
                            }}
                          >
                            Grant
                          </button>
                        )}
                        {req.status === "Approved" && (
                          <button
                            className="btn-action revoke"
                            onClick={() => handleRevoke(req.id)}
                          >
                            Revoke
                          </button>
                        )}
                        {req.status === "Pending" && (
                          <button
                            className="btn-action suspend"
                            onClick={() => handleSuspend(req.id)}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    No {activeTab.toLowerCase()} authorization requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* GRANT ACCESS MODAL */}
      {isGrantModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box grant-access-modal">
            <div className="modal-header">
              <UserPlus size={20} className="text-cyan" />
              <h3>Grant User Authorization</h3>
              <button className="close-btn" onClick={() => setIsGrantModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInitiateGrant} className="modal-body form-stack">
              <div className="auth-input-group">
                <label>User Work Email</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    placeholder="employee@medverse.hospital"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-input-group">
                  <label>Assigned Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {Object.values(ROLES).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-input-group">
                  <label>Department Wing</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-input-group">
                  <label>Access Level</label>
                  <select
                    value={selectedAccessLevel}
                    onChange={(e) => setSelectedAccessLevel(e.target.value)}
                  >
                    {ACCESS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-input-group">
                  <label>Access Expiration Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsGrantModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Proceed to 2FA Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA OTP MODAL FOR AUTHORIZATION EXECUTION */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        recipient="Authorized Admin Email"
        onSuccess={handleConfirmGrantWithOTP}
      />
    </div>
  );
}
