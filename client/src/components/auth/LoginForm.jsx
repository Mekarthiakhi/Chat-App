import { TextField, Button, Typography, Box } from "@mui/material";

const LoginForm = () => {
    const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: "12px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,0,0,0.12)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#38bdf8",
  },
};
  return (

    <Box>
      <TextField label="Username" fullWidth margin="normal" sx={inputStyle} />
      <TextField label="Password" type="password" fullWidth margin="normal" sx={inputStyle} />

      <Typography
        variant="body2"
        sx={{ mt: 1, textAlign: "right", color: "#38bdf8", cursor: "pointer" }}
      >
        Forgot password?
      </Typography>

      <Button
        fullWidth
        size="large"
        sx={{
          mt: 3,
          color: "#fff",
          fontWeight: 600,
          borderRadius: "12px",
          background: "linear-gradient(90deg,#38bdf8,#6366f1)",
        }}
      >
        Login
      </Button>
    </Box>
  );
};

export default LoginForm;
