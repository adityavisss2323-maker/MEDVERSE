import { useAuth } from "../context/AuthContext";
import { getPermissionsForRole, hasRolePermission, PERMISSIONS } from "../utils/permissions";
import { ROLES } from "../types";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || ROLES.SOC_ANALYST;

  const permissions = getPermissionsForRole(role);

  const can = (permission) => {
    return hasRolePermission(role, permission);
  };

  const isManagementAuthorized = () => {
    return (
      role === ROLES.CISO ||
      role === ROLES.SOC_LEAD ||
      role === ROLES.SECURITY_ADMIN
    );
  };

  return {
    role,
    permissions,
    can,
    isManagementAuthorized,
    PERMISSIONS
  };
}
