import { TextField, Button, Box, Typography } from "@mui/material";

const LoginForm = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Welcome Back
      </Typography>

      <TextField
        label="Username"
        fullWidth
        margin="normal"
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 2 }}
      >
        Login
      </Button>
    </Box>
  );
};

export default LoginForm;
