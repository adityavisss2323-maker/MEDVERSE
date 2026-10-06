/**
 * OTP Service - Service abstraction for 6-Digit Email & Phone OTP verification
 */

export const otpService = {
  async sendOtp(recipient) {
    await new Promise((res) => setTimeout(res, 500));
    return {
      success: true,
      message: `A verification code has been dispatched to ${recipient || "your registered email"}.`,
      expiresInSeconds: 60
    };
  },

  async verifyOtp(recipient, code) {
    await new Promise((res) => setTimeout(res, 500));
    // Accepts 6-digit code simulation
    if (!code || code.length !== 6) {
      return { success: false, error: "Please enter a valid 6-digit code." };
    }

    if (code === "000000") {
      return { success: false, error: "Expired code. Please request a new OTP." };
    }

    return { success: true, message: "Verification successful." };
  },

  async resendOtp(recipient) {
    return this.sendOtp(recipient);
  }
};
