import { Tabs, Tab, Box, Typography } from "@mui/material";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const backCover = "/backCover.png";

const AuthTabs = ({ onLogin, apiCall }) => {
  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        position: "relative",
        backgroundImage: `url(${backCover})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 🌈 LIGHT GRADIENT OVERLAY */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(255,0,150,0.25), transparent),
            radial-gradient(circle at 80% 70%, rgba(0,200,255,0.25), transparent),
            linear-gradient(120deg, rgba(20,20,40,0.4), rgba(40,20,60,0.35))
          `,
          backdropFilter: "blur(2px)",
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
          px: 8,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: "1px",
              textShadow: "0 6px 30px rgba(0,0,0,0.6)",
            }}
          >
            Find Your Match ❤️
          </Typography>

          <Typography
            sx={{
              mt: 2,
              opacity: 0.8,
              fontSize: "18px",
            }}
          >
            Connect. Chat. Meet.
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE */}
      <Box
        sx={{
          width: { xs: "100%", md: "500px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          px: 2,
        }}
      >
        {/* 💎 GLASS CARD */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "420px",
            p: 4,
            borderRadius: "26px",

            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",

            background: `
              linear-gradient(
                135deg,
                rgba(255,255,255,0.18),
                rgba(255,255,255,0.05)
              )
            `,

            border: "1px solid rgba(255,255,255,0.25)",

            boxShadow: `
              0 10px 40px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.3)
            `,

            position: "relative",
            overflow: "hidden",
            color: "#fff",
          }}
        >
          {/* 🔥 GLOW BORDER EFFECT */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "26px",
              padding: "1px",
              background:
                "linear-gradient(135deg, rgba(255,0,150,0.4), rgba(0,200,255,0.4))",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            }}
          />

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            centered
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              mb: 3,
              "& .MuiTabs-indicator": {
                height: "3px",
                borderRadius: "10px",
                background:
                  "linear-gradient(90deg, #ff00cc, #3333ff)",
              },
              "& .MuiTab-root": {
                color: "#bbb",
                fontWeight: 500,
                textTransform: "none",
                fontSize: "16px",
              },
              "& .Mui-selected": {
                color: "#fff",
              },
            }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {/* ✨ ANIMATED FORM SWITCH */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === 0 ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 0 ? 40 : -40 }}
              transition={{ duration: 0.35 }}
            >
              {tab === 0 ? (
                <LoginForm onLogin={onLogin} apiCall={apiCall} />
              ) : (
                <RegisterForm onLogin={onLogin} apiCall={apiCall} />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthTabs;