/**
 * Input Validation Utilities
 * Provides validation functions for common inputs
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

export const validateUsername = (username) => {
  // 3-30 chars, alphanumeric + underscore only
  const re = /^[a-zA-Z0-9_]{3,30}$/;
  return re.test(username);
};

export const validateAge = (age) => {
  const ageNum = parseInt(age);
  return ageNum >= 18 && ageNum <= 120;
};

export const validateGender = (gender) => {
  return ['Male', 'Female', 'Other'].includes(gender);
};

export const validateCountry = (country) => {
  return country && typeof country === 'string' && country.length > 0;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '').slice(0, 1000);
};

export const validateMessageContent = (content) => {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= 5000;
};

export const validateRoom = (room) => {
  return ['general', 'flirt', 'friends', 'random'].includes(room);
};

export const validateUserId = (userId) => {
  // MongoDB ObjectId format
  return /^[0-9a-fA-F]{24}$/.test(userId);
};

/**
 * Comprehensive registration validation
 */
export const validateRegistrationData = (data) => {
  const errors = [];

  if (!data.username) {
    errors.push('Username is required');
  } else if (!validateUsername(data.username)) {
    errors.push('Username must be 3-30 characters, alphanumeric and underscore only');
  }

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (!validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  if (data.age && !validateAge(data.age)) {
    errors.push('Age must be between 18 and 120');
  }

  if (data.gender && !validateGender(data.gender)) {
    errors.push('Invalid gender value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Comprehensive login validation
 */
export const validateLoginData = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push('Email is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validateAge,
  validateGender,
  validateCountry,
  sanitizeInput,
  validateMessageContent,
  validateRoom,
  validateUserId,
  validateRegistrationData,
  validateLoginData
};
