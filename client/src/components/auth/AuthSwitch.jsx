import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import QuickStartForm from "./QuickStartForm";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

const AuthSwitch = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        centered
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
  mb: 3,
  backgroundColor: "rgba(255,255,255,0.9)",
  borderRadius: "18px",
  p: 0.5,
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  "& .MuiTab-root": {
    fontWeight: 600,
    textTransform: "none",
    minHeight: "44px",
    borderRadius: "14px",
  },
  "& .Mui-selected": {
    color: "#2563eb",
    background:
      "linear-gradient(90deg, #e0f2fe, #eef2ff)",
  },
}}
      >
        <Tab label="Start Chat" />
        <Tab label="Register" />
        <Tab label="Login" />
      </Tabs>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {tab === 0 && <QuickStartForm />}
        {tab === 1 && <RegisterForm />}
        {tab === 2 && <LoginForm />}
      </Box>
    </Box>
  );
};

export default AuthSwitch;
