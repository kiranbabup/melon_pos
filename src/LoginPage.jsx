// LoginPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import companyLogo from "./data/images/invposlogo.png";
import sendOtpimg from "./data/images/Loginicon.png";
import "./App.css";
import LsService, { storageKey } from "./services/localstorage";
import { login } from "./services/api";

const LoginPage = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const user = LsService.getItem(storageKey);

  useEffect(() => {
    console.log(user);
    if (user) {
      if (user.role === "super_admin") {
        navigate("/super_admin");
      } else if (user.role === "admin") {
        navigate("/admin_panel");
      } else if (user.role === "cashier") {
        navigate("/cashier_billing_panel");
      }
    } else {
      return;
    }
  }, [user, navigate]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    setErrorMsg("");
    try {
      const response = await login({ email: loginId, password });
      console.log(response.data);
      const { token } = response.data;
      const branchDetails = response.data.user.Branch;
      const { branch_id, name, role, status, user_id } = response.data.user;
      if (!status) {
        setErrorMsg(
          "Your account is inactive. Please contact the administrator."
        );
        return;
      }
      LsService.setCurrentUser({
        username: name,
        role,
        branch_id,
        email: loginId,
        user_id,
        token,
        branchDetails,
      });
      if (role === "super_admin") {
        navigate("/super_admin");
      } else if (role === "admin") {
        navigate("/admin_panel");
      } else if (role === "cashier") {
        navigate("/cashier_billing_panel");
      } else {
        setErrorMsg("Invalid user type.");
      }
    } catch (error) {
      setErrorMsg("Invalid Login ID or Password or contact Administrator.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
      }}
    >
      <Box
        component="img"
        alt="Company Logo"
        src={companyLogo}
        sx={{
          width: "65px",
          cursor: "pointer",
          display: { md: "none", xs: "block" },
          pl: 2,
          paddingTop: "10px",
        }}
        onClick={() => navigate("/")}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "start",
          height: { md: "100vh", xs: "calc(100vh - 68px)" },
        }}
      >
        {/* left */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            display: { xs: "none", md: "block" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Box
              component="img"
              alt="Company Logo"
              src={companyLogo}
              sx={{
                width: "250px",
                // ml: 2,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            />
          </Box>
        </Box>
        {/* right */}
        <Box
          sx={{
            width: { md: "50%" },
            p: { xs: 2, md: 0 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: { md: "#577fd8d9" },
            height: "100%",
          }}
        >
          <Box sx={{ width: { md: "50%" } }}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                component="img"
                alt="otp page"
                src={sendOtpimg}
                sx={{
                  width: "130px",
                  height: "140px",
                  cursor: "pointer",
                }}
              />
            </Box>
            <Typography
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", md: "2.5rem" },
                fontWeight: "bold",
                textAlign: "center",
                color: { md: "white" },
              }}
            >
              Login Now !
            </Typography>

            <TextField
              label="Login ID"
              variant="outlined"
              fullWidth
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{
                maxLength: 30,
                style: { textAlign: "center", fontWeight: "bold" },
                sx: { color: { md: "white" } },
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{
                maxLength: 15,
                style: { textAlign: "center", fontWeight: "bold" },
                sx: { color: { md: "white" } },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />

            {errorMsg && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Typography>
            )}
            {!errorMsg && <Box p={2.5} />}

            <Button
              variant="contained"
              sx={{ fontWeight: "bold" }}
              type="submit"
              color="primary"
              fullWidth
              onClick={() => handleLogin()}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
