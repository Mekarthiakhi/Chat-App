import { TextField, Button, Box, Typography } from "@mui/material";
import { useState } from "react";

const LoginForm = ({ onLogin, apiCall }) => {
  const [form, setForm] = useState({ username: "", password: "" });

async function handleSubmit(e) {
  e.preventDefault();

  const useMock = true; // 🔥 toggle here

  if (useMock) {
    onLogin("demo-token", { name: form.username || "Demo User" });
    return;
  }

  try {
    const data = await apiCall("/login", "POST", form);
    onLogin(data.token, data.user || {});
  } catch (err) {
    alert(err.message);
  }
}

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2}>Welcome Back 👋</Typography>

  <TextField
  label="Username"
  variant="outlined"
  fullWidth
  value={form.username}
  onChange={(e) =>
    setForm({ ...form, username: e.target.value })
  }
  InputLabelProps={{ shrink: true }}
  sx={{
    mb: 2,

    // Label default
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.6)",
    },

    // Label when focused → WHITE
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#fff",
    },

    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      background: "rgba(255,255,255,0.05)",

      // Default border
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.2)",
      },

      // Hover border
      "&:hover fieldset": {
        borderColor: "#fff",
      },

      // Focus border → WHITE
      "&.Mui-focused fieldset": {
        borderColor: "#fff",
        boxShadow: "0 0 6px rgba(255,255,255,0.3)",
      },
    },

    // Input text styling
    input: {
      color: "#fff",
    },
  }}
/>
<TextField
  label="Password"
  type="password"
  fullWidth
  value={form.password}
  onChange={(e) =>
    setForm({ ...form, password: e.target.value })
  }
  InputLabelProps={{ shrink: true }}
  sx={{
    mb: 2,

    // ✅ Label default
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.6)",
    },

    // ✅ Label when focused → WHITE
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#fff",
    },

    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      background: "rgba(255,255,255,0.05)",

      // ✅ Default border
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.2)",
      },

      // ✅ Hover border
      "&:hover fieldset": {
        borderColor: "#fff",
      },

      // ✅ Focus border → WHITE (removes blue)
      "&.Mui-focused fieldset": {
        borderColor: "#fff",
        boxShadow: "0 0 6px rgba(255,255,255,0.3)",
      },
    },

    // ✅ Input text
    input: {
      color: "#fff",
    },
  }}
/>

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
        Login
      </Button>
    </Box>
  );
};

export default LoginForm;