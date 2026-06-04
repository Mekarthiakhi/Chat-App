/**
 * Password Validation Utilities
 * Comprehensive password strength checking and validation
 */

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
export const validatePasswordStrength = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Check password requirements and return detailed feedback
 */
export const checkPasswordRequirements = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  };

  return {
    ...requirements,
    isStrong:
      requirements.minLength &&
      requirements.hasUppercase &&
      requirements.hasLowercase &&
      requirements.hasNumber &&
      requirements.hasSpecialChar,
  };
};

/**
 * Calculate password strength score (0-100)
 */
export const calculatePasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength += 15;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[@$!%*?&]/.test(password)) strength += 15;

  // Bonus for variety
  const varietyCount = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[@$!%*?&]/.test(password),
  ].filter(Boolean).length;

  if (varietyCount === 4) strength += 5;

  return Math.min(strength, 100);
};

/**
 * Get password strength level
 */
export const getPasswordStrengthLevel = (strength) => {
  if (strength < 30) return "Weak";
  if (strength < 60) return "Fair";
  if (strength < 80) return "Good";
  return "Strong";
};

/**
 * Get password strength color for UI
 */
export const getPasswordStrengthColor = (strength) => {
  if (strength < 30) return "#ff4444"; // Red
  if (strength < 60) return "#ffaa00"; // Orange
  if (strength < 80) return "#88dd00"; // Yellow-green
  return "#00cc44"; // Green
};

/**
 * Validate password format with detailed error messages
 */
export const validatePasswordFormat = (password) => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain lowercase letters" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain uppercase letters" };
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: "Password must contain numbers" };
  }

  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, error: "Password must contain special characters (@$!%*?&)" };
  }

  return { valid: true, error: null };
};

/**
 * Check if two passwords match
 */
export const passwordsMatch = (password1, password2) => {
  return password1 === password2;
};

/**
 * Check if new password is different from old password
 */
export const isNewPasswordDifferent = (oldPassword, newPassword) => {
  return oldPassword !== newPassword;
};

export default {
  validatePasswordStrength,
  checkPasswordRequirements,
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  getPasswordStrengthColor,
  validatePasswordFormat,
  passwordsMatch,
  isNewPasswordDifferent,
};
