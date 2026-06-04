import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from "@mui/material";
import { useState } from "react";
import { changePassword as changePasswordAPI } from "../../services/apiAuth";
import LockIcon from "@mui/icons-material/Lock";

const fieldSx = {
  mb: 2,
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.6)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#fff",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.2)",
    },
    "&:hover fieldset": {
      borderColor: "#fff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fff",
      boxShadow: "0 0 6px rgba(255,255,255,0.3)",
    },
  },
  "& input": {
    color: "#fff",
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px rgba(73, 73, 97, 0.95) inset",
    WebkitTextFillColor: "#fff",
    caretColor: "#fff",
  },
};

const ChangePassword = ({ onSuccess }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, newPassword: value });
    setPasswordStrength(checkPasswordStrength(value));
  };

  const getStrengthColor = () => {
    if (passwordStrength < 30) return "#ff4444";
    if (passwordStrength < 60) return "#ffaa00";
    if (passwordStrength < 80) return "#88dd00";
    return "#00cc44";
  };

  const getStrengthText = () => {
    if (passwordStrength < 30) return "Weak";
    if (passwordStrength < 60) return "Fair";
    if (passwordStrength < 80) return "Good";
    return "Strong";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (!form.currentPassword) {
        throw new Error("Current password is required");
      }

      if (!form.newPassword) {
        throw new Error("New password is required");
      }

      if (!form.confirmPassword) {
        throw new Error("Confirm password is required");
      }

      if (form.newPassword !== form.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      if (form.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      if (passwordStrength < 60) {
        throw new Error(
          "Password is too weak. Use uppercase, lowercase, numbers, and special characters"
        );
      }

      if (form.currentPassword === form.newPassword) {
        throw new Error("New password must be different from current password");
      }

      const response = await changePasswordAPI(
        form.currentPassword,
        form.newPassword,
        form.confirmPassword
      );

      setSuccess(response.message || "Password changed successfully!");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <LockIcon sx={{ color: "#fff" }} />
        <Typography variant="h5">Change Password 🔐</Typography>
      </Box>

      <TextField
        label="Current Password"
        type="password"
        variant="outlined"
        fullWidth
        value={form.currentPassword}
        onChange={(e) =>
          setForm({ ...form, currentPassword: e.target.value })
        }
        InputLabelProps={{ shrink: true }}
        sx={fieldSx}
        disabled={loading}
      />

      <TextField
        label="New Password"
        type="password"
        fullWidth
        value={form.newPassword}
        onChange={handleNewPasswordChange}
        InputLabelProps={{ shrink: true }}
        sx={fieldSx}
        disabled={loading}
        helperText={
          form.newPassword && `Strength: ${getStrengthText()}`
        }
      />

      {form.newPassword && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={passwordStrength}
            sx={{
              height: 6,
              borderRadius: "3px",
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: getStrengthColor(),
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
            💡 Use: uppercase, lowercase, numbers, special chars (@$!%*?&)
          </Typography>
        </Box>
      )}

      <TextField
        label="Confirm New Password"
        type="password"
        fullWidth
        value={form.confirmPassword}
        onChange={(e) =>
          setForm({ ...form, confirmPassword: e.target.value })
        }
        InputLabelProps={{ shrink: True }}
        sx={fieldSx}
        disabled={loading}
      />

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: "10px",
            backgroundColor: "rgba(255, 68, 68, 0.15)",
            color: "#ff6b6b",
            border: "1px solid rgba(255, 68, 68, 0.3)",
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: "10px",
            backgroundColor: "rgba(68, 255, 68, 0.15)",
            color: "#6bff6b",
            border: "1px solid rgba(68, 255, 68, 0.3)",
          }}
        >
          {success}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          mt: 2,
          height: 46,
          background: "linear-gradient(90deg, #ff00cc, #3333ff)",
          "&:hover": {
            background: "linear-gradient(90deg, #ff00aa, #1111dd)",
          },
        }}
      >
        {loading ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          "CHANGE PASSWORD"
        )}
      </Button>
    </Box>
  );
};

export default ChangePassword;
