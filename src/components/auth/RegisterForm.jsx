import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
} from "@mui/material";

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&:hover fieldset": { borderColor: "#fff" },
  },
  "& .MuiInputLabel-root": { color: "#aaa" },
};

const RegisterForm = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Create Account 💖
      </Typography>

      <TextField label="Name" fullWidth margin="normal" sx={inputStyle} />
      <TextField label="Age" type="number" fullWidth margin="normal" sx={inputStyle} />

      <TextField select label="Gender" fullWidth margin="normal" sx={inputStyle}>
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>

      <TextField label="State" fullWidth margin="normal" sx={inputStyle} />
      <TextField label="Username" fullWidth margin="normal" sx={inputStyle} />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        sx={inputStyle}
      />

      <Button
        fullWidth
        size="large"
        sx={{
          mt: 2,
          background: "linear-gradient(45deg, #ff4d6d, #ff758c)",
          color: "#fff",
          borderRadius: "10px",
        }}
      >
        Register
      </Button>
    </Box>
  );
};

export default RegisterForm;