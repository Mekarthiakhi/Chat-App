import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../services/apiAuth";

const fieldSx = {
  mb: 2,
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "rgba(255,255,255,0.05)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "#fff" },
    "&.Mui-focused fieldset": { borderColor: "#fff" },
  },
  "& input": { color: "#fff" },
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 4, 
          borderRadius: "20px", 
          background: "rgba(30, 41, 59, 0.7)", 
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <Typography variant="h5" mb={3} color="white">Reset Password 🔒</Typography>

        {success ? (
          <Alert severity="success">
            Password reset successful! Redirecting to login...
          </Alert>
        ) : (
          <>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={fieldSx}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              sx={fieldSx}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ height: 46 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "RESET PASSWORD"}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default ResetPassword;
