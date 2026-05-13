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
import { loginUser, forgotPassword, sendMagicLink } from "../../services/apiAuth";

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
  const [isMagic, setIsMagic] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (isForgot) {
        const data = await forgotPassword(form.email);
        setInfo(data.message);
      } else if (isMagic) {
        const data = await sendMagicLink(form.email);
        setInfo(data.message);
      } else {
        const data = await loginUser(form.email, form.password);
        onLogin(data.token, data.user);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  function friendlyError(code) {
    if (code === 'Please verify your email first') {
      return "Please verify your email before logging in. Check your inbox for the link.";
    }
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
      case "Invalid credentials":
        return "Incorrect email or password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      default:
        return code || "Login failed. Please try again.";
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2}>Welcome Back 👋</Typography>

      <TextField
        label="Email or Username"
        variant="outlined"
        fullWidth
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={fieldSx}
      />

      {!isMagic && !isForgot && (
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={fieldSx}
        />
      )}

      {!isMagic && !isForgot && (
        <Box sx={{ textAlign: "right", mt: -1, mb: 1 }}>
          <Link
            component="button"
            type="button"
            variant="caption"
            onClick={() => setIsForgot(true)}
            sx={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", "&:hover": { color: "#fff" } }}
          >
            Forgot Password?
          </Link>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1, borderRadius: "10px" }}>
          {error}
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
        {loading ? <CircularProgress size={22} color="inherit" /> : (isForgot ? "SEND RESET LINK" : isMagic ? "SEND LOGIN LINK" : "LOGIN")}
      </Button>

      <Button
        fullWidth
        variant="text"
        onClick={() => {
          setIsMagic(!isMagic);
          setIsForgot(false);
          setError("");
          setInfo("");
        }}
        sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}
      >
        {isForgot ? "Back to Login" : isMagic ? "Use Password Instead" : "Login with Email Link"}
      </Button>

      {isForgot && (
        <Button
          fullWidth
          variant="text"
          onClick={() => {
            setIsForgot(false);
            setError("");
            setInfo("");
          }}
          sx={{ mt: 0, color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
};

export default LoginForm;
