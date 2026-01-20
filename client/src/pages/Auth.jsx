import { Box, Paper } from "@mui/material";
import AuthSwitch from "../components/auth/AuthSwitch";

const Auth = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundImage: "url('/images/bg1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      {/* Glassy sticky card */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: "100%", md: "35%" },
          height: "90vh",
          mr: { md: 4 },
          p: 4,

          /* Glassmorphism */
          background: "rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.35)",

          /* Rounded & shadow */
          borderRadius: "28px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.45)",

          /* Layout */
          display: "flex",
          flexDirection: "column",

          /* Sticky behavior */
          position: "sticky",
          top: "5vh",
        }}
      >
        <AuthSwitch />
      </Paper>
    </Box>
  );
};

export default Auth;
