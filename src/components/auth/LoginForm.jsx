import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import { useState } from "react";
import { loginUser, resendVerificationEmail } from "../../firebase/authService";

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
  "& input:-webkit-autofill:focus": {
    WebkitBoxShadow: "0 0 0 100px rgba(73, 73, 97, 0.95) inset",
    WebkitTextFillColor: "#fff",
  },
};

const LoginForm = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const { token, user } = await loginUser(form.email, form.password);
      onLogin(token, user);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await resendVerificationEmail();
      setInfo("Verification email resent! Check your inbox.");
    } catch (err) {
      setError("Could not resend email. Please try again later.");
    } finally {
      setResending(false);
    }
  }

  function friendlyError(code) {
    switch (code) {
      case "auth/email-not-verified":
        return "Please verify your email before logging in.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";
      default:
        return "Login failed. Please try again.";
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2}>Welcome Back 👋</Typography>

      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={fieldSx}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={fieldSx}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 1, borderRadius: "10px" }}>
          {error}
          {error.includes("verify") && (
            <Box mt={1}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={handleResend}
                disabled={resending}
                sx={{ color: "inherit", textDecoration: "underline" }}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </Link>
            </Box>
          )}
        </Alert>
      )}

      {info && (
        <Alert severity="info" sx={{ mb: 1, borderRadius: "10px" }}>
          {info}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 2, height: 46 }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : "LOGIN"}
      </Button>
    </Box>
  );
};

export default LoginForm;
