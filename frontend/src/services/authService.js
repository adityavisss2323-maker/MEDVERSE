/**
 * Auth Service - Backend-Ready Service Layer for Authentication
 */

export const authService = {
  async login({ email, password, role, rememberMe }) {
    await new Promise((res) => setTimeout(res, 600));

    // Basic client side validation
    if (!email || !password) {
      throw new Error("Invalid credentials provided.");
    }

    const initials = email
      ? email.split("@")[0].substring(0, 2).toUpperCase()
      : "US";

    return {
      id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email,
      role: role || "SOC Analyst",
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: "Emergency & Cyber Operations",
      jobTitle: "Security Operations Analyst",
      phone: "+1 (555) 019-2831",
      avatar: initials,
      isAuthenticated: true,
      requiresOtp: false,
      requires2FA: false,
      isNewDevice: false,
    };
  },

  async register(registrationData) {
    await new Promise((res) => setTimeout(res, 700));

    return {
      success: true,
      requiresAuthorization: true,
      message: "Your account has been created and requires authorization.",
      email: registrationData.email
    };
  },

  async verifyOtp(email, code) {
    await new Promise((res) => setTimeout(res, 500));
    if (code !== "123456" && code.length !== 6) {
      throw new Error("Invalid or expired 6-digit verification code.");
    }
    return { success: true };
  },

  async verify2FA(code, method = "authenticator") {
    await new Promise((res) => setTimeout(res, 500));
    if (code.length !== 6) {
      throw new Error("Invalid two-factor authentication token.");
    }
    return { success: true };
  },

  async changePassword({ currentPassword, newPassword }) {
    await new Promise((res) => setTimeout(res, 600));
    if (!currentPassword) {
      throw new Error("Current password is required.");
    }
    return { success: true, message: "Password updated successfully." };
  },

  async resetPasswordRequest(email) {
    await new Promise((res) => setTimeout(res, 500));
    return { success: true, message: "Password reset verification code sent to work email." };
  }
};
