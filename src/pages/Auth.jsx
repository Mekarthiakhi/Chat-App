import { Box, Grid, Paper } from "@mui/material";
import AuthTabs from "../components/auth/AuthTabs";
import Lottie from "lottie-react";
// import chatAnimation from "../assets/chat-animation.json";

const Auth = () => {
  return (
    <Grid container minHeight="100vh">
      {/* LEFT – Animation (70%) */}
      <Grid
        item
        xs={12}
        md={8}
        sx={{
          backgroundColor: "#f5f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "80%", maxWidth: 500 }}>
          {/* <Lottie animationData={chatAnimation} loop /> */}
        </Box>
      </Grid>

      {/* RIGHT – Login/Register (30%) */}
      <Grid
        item
        xs={12}
        md={4}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
        }}
      >
        <AuthTabs />
      </Grid>
    </Grid>
  );
};

export default Auth;
