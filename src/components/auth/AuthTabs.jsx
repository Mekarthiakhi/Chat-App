import { Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthTabs = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
        <Tab label="Login" />
        <Tab label="Register" />
      </Tabs>

      <Box mt={3}>
        {tab === 0 ? <LoginForm /> : <RegisterForm />}
      </Box>
    </Box>
  );
};

export default AuthTabs;
