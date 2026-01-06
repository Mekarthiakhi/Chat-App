import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
} from "@mui/material";

const RegisterForm = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Create Account
      </Typography>

      <TextField label="Name" fullWidth margin="normal" />

      <TextField
        label="Age"
        type="number"
        fullWidth
        margin="normal"
      />

      <TextField
        select
        label="Gender"
        fullWidth
        margin="normal"
      >
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>

      <TextField
        label="State"
        fullWidth
        margin="normal"
      />

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
        Register
      </Button>
    </Box>
  );
};

export default RegisterForm;
