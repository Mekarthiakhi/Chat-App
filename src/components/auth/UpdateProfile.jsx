import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { updateProfile as updateProfileAPI } from "../../services/apiAuth";
import PersonIcon from "@mui/icons-material/Person";

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

const UpdateProfile = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
  });
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  // Load current name from localStorage
  useEffect(() => {
    const user = localStorage.getItem("chat_user");
    if (user) {
      const userData = JSON.parse(user);
      setForm({ name: userData.username || "" });
      setOriginalName(userData.username || "");
    }
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm({ name: value });
    setIsChanged(value.trim() !== originalName);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (form.name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters");
      }

      if (form.name.trim().length > 50) {
        throw new Error("Name must be less than 50 characters");
      }

      if (form.name.trim() === originalName) {
        throw new Error("Please change the name to update");
      }

      const response = await updateProfileAPI(form.name);

      setSuccess(response.message || "Profile updated successfully!");
      setOriginalName(form.name.trim());
      setIsChanged(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setForm({ name: originalName });
    setIsChanged(false);
    setError("");
    setSuccess("");
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <PersonIcon sx={{ color: "#fff" }} />
        <Typography variant="h5">Update Profile 👤</Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(255,255,255,0.7)",
          mb: 2,
          fontSize: "13px",
        }}
      >
        💡 Optional: Update your display name. Leave empty to keep current name.
      </Typography>

      <TextField
        label="Display Name (Optional)"
        variant="outlined"
        fullWidth
        value={form.name}
        onChange={handleNameChange}
        placeholder={originalName || "Your name"}
        InputLabelProps={{ shrink: true }}
        sx={fieldSx}
        disabled={loading}
        helperText={
          form.name.length > 0
            ? `${form.name.length}/50 characters`
            : "Leave empty to skip updating"
        }
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

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading || !isChanged}
          sx={{
            height: 46,
            background: isChanged
              ? "linear-gradient(90deg, #00cc88, #00aa66)"
              : "rgba(255,255,255,0.1)",
            color: isChanged ? "#fff" : "rgba(255,255,255,0.4)",
            "&:hover": isChanged
              ? {
                  background: "linear-gradient(90deg, #00dd99, #00bb77)",
                }
              : {},
          }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "UPDATE NAME"
          )}
        </Button>

        {isChanged && (
          <Button
            type="button"
            fullWidth
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
            sx={{
              height: 46,
              borderColor: "rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.7)",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.5)",
                backgroundColor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            RESET
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default UpdateProfile;
