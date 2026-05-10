import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { registerUser } from "../../firebase/authService";

const RegisterForm = ({ onLogin }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await registerUser(
        form.email,
        form.password,
        form.username
      );
      setSuccess(true);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function friendlyError(code) {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      default:
        return "Registration failed. Please try again.";
    }
  }


  const fieldSx = {
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

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2}>Create Account 💖</Typography>

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        sx={fieldSx}
      />

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        sx={fieldSx}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        sx={fieldSx}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 1, mb: 1, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 1, mb: 1, borderRadius: "10px" }}>
          Verification email sent! Please check your inbox.
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 2, height: 46 }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : "Register"}
      </Button>
    </Box>
  );
};

export default RegisterForm;