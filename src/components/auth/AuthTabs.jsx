import { Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthTabs = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        overflow: "hidden",

        backgroundImage: `url("/cover_page.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        // 🔥 subtle zoom animation
        animation: "bgZoom 20s ease-in-out infinite alternate",

        // 🔥 KEYFRAMES (must be here or global)
        "@keyframes gradientMove": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },

        "@keyframes bgZoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
      }}
    >
      {/* 🔥 Animated Gradient Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",

          background: `
            linear-gradient(
              120deg,
              rgba(255, 0, 120, 0.3),
              rgba(0, 0, 0, 0.85),
              rgba(0, 150, 255, 0.3)
            )
          `,
          backgroundSize: "200% 200%",
          animation: "gradientMove 12s ease infinite",
        }}
      />

      {/* LEFT SIDE */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 2,
          px: 6,
        }}
      >
        <Box>
          <h1 style={{ fontSize: "52px", marginBottom: "12px" }}>
            Find Your Match ❤️
          </h1>
          <p style={{ opacity: 0.75, fontSize: "18px" }}>
            Connect. Chat. Meet.
          </p>
        </Box>
      </Box>

      {/* RIGHT SIDE (Glass Card) */}
      <Box
        sx={{
          width: { xs: "100%", md: "420px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          p: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",

            p: 4,
            borderRadius: "20px",
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            color: "#fff",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            centered
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              mb: 2,
              "& .MuiTab-root": { color: "#aaa" },
              "& .Mui-selected": { color: "#fff" },
            }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {tab === 0 ? <LoginForm /> : <RegisterForm />}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthTabs;