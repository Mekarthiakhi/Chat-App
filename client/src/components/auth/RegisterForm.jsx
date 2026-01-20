import { Box, TextField, Button, MenuItem, Typography } from "@mui/material";

const RegisterForm = () => {

    const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: "8px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,0,0,0.12)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ffffff",
  },
};
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 600, color: "#0f172a" }}
      >
        Create Account
      </Typography>

      <TextField
        label="Full Name"
        fullWidth
        margin="normal"
        sx={inputStyle}
      />

      <TextField
        label="Age"
        type="number"
        fullWidth
        margin="normal"
        sx={inputStyle}
      />

      <TextField
        select
        label="Gender"
        fullWidth
        margin="normal"
        sx={inputStyle}
      >
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>

      <TextField
        label="State"
        fullWidth
        margin="normal"
        sx={inputStyle}
      />

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        sx={inputStyle}
      />

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
          mt: 3,
          color: "#fff",
          fontWeight: 600,
          borderRadius: "12px",
          background: "linear-gradient(90deg,#38bdf8,#6366f1)",
          boxShadow: "0 10px 20px rgba(56,189,248,0.35)",
          ":hover": {
            background: "linear-gradient(90deg,#60a5fa,#818cf8)",
          },
        }}
      >
        Register
      </Button>
    </Box>
  );
};

export default RegisterForm;
