import {
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";

const RegisterForm = ({ onLogin, apiCall }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await apiCall("/register", "POST", form);
      onLogin(data.token, data.user);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2}>Create Account 💖</Typography>

      <TextField label="Username" fullWidth margin="normal"
        onChange={(e) =>
          setForm({ ...form, username: e.target.value })
        }
      />

      <TextField label="Email" fullWidth margin="normal"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <TextField label="Password" type="password" fullWidth margin="normal"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
        Register
      </Button>
    </Box>
  );
};

export default RegisterForm;