import { TextField, Button, MenuItem, Box } from "@mui/material";

const QuickStartForm = () => {
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
      <TextField label="Name" sx={inputStyle} fullWidth margin="normal" />
      <TextField label="Age" sx={inputStyle} type="number" fullWidth margin="normal" />
      <TextField select label="Gender" fullWidth margin="normal" sx={inputStyle} >
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>
      <TextField label="State" fullWidth margin="normal" sx={inputStyle} />

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
        START CHAT
      </Button>
    </Box>
  );
};

export default QuickStartForm;
