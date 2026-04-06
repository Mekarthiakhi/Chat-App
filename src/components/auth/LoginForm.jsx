import { TextField, Button, Box, Typography } from "@mui/material";

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&:hover fieldset": { borderColor: "#fff" },
  },
  "& .MuiInputLabel-root": { color: "#aaa" },
};

const LoginForm = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Welcome Back 👋
      </Typography>

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
        Login
      </Button>
    </Box>
  );
};

export default LoginForm;