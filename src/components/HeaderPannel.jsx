import { Box, Popover, Typography, Button, Divider } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../services/localstorage";
import DownloadIcon from "@mui/icons-material/Download";

const HeaderPannel = ({ HeaderTitle, tableData, onDownloadCurrentList }) => {
  const userLoginStatus = LsService.getItem(storageKey);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogoutClick = () => {
    LsService.removeItem(storageKey);
    navigate("/");
  };

  useEffect(() => {
    if (!userLoginStatus || !userLoginStatus.token) return;

    try {
      const token = userLoginStatus.token;

      // Decode JWT payload (handle URL-safe base64 too)
      const payloadBase64 = token
        .split(".")[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      if (!payload.exp) return; // no exp, nothing to schedule

      const expiryMs = payload.exp * 1000; // exp is in seconds
      const nowMs = Date.now();
      const timeLeft = expiryMs - nowMs;
      
      if (timeLeft <= 0) {
        // already expired -> logout immediately
        onLogoutClick();
        return;
      }

      // schedule logout when token expires
      const timeoutId = setTimeout(() => {
        onLogoutClick();
      }, timeLeft);

      // cleanup if component unmounts or token changes
      return () => clearTimeout(timeoutId);
    } catch (err) {
      console.error("Failed to decode JWT", err);
      // optional: logout on invalid token
      // LsService.removeItem(storageKey);
      // navigate("/");
    }
  }, [userLoginStatus?.token, navigate]);

  const open = Boolean(anchorEl);

  if (!userLoginStatus) return null;

  return (
    <Box
      sx={{
        height: "6vh",
        mt: 1.5,
        mb: 1.5,
        mr: 1.5,
        p: 2,
        boxShadow:
          "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
        backgroundColor: "#fafafa",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography sx={{ fontWeight: "bold", fontSize: 22 }}>
        {HeaderTitle}
      </Typography>

      {tableData && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          sx={{ mr: 1, fontWeight: "bold" }}
          onClick={() => onDownloadCurrentList()}
        >
          Download Current list <DownloadIcon sx={{ ml: 1 }} />
        </Button>
      )}

      <Box
        sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}
      >
        <Box
          sx={{
            height: 40,
            // bgcolor: "navy",
            bgcolor: "#f47920",
            color: "#fff",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            pr: 1,
            cursor: "pointer",
          }}
          onClick={(e) => handleAvatarClick(e)}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "navy",
              color: "#fff",
              borderRadius: "50%",
              border: "3px solid white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: 22,
            }}
          >
            {userLoginStatus.role.slice(0, 1).toUpperCase()}
          </Box>
          {userLoginStatus.role.slice(1)}
        </Box>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: { p: 2, minWidth: 220, borderRadius: 3 },
          }}
        >
          <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
            {userLoginStatus.username}
          </Typography>
          <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
            {userLoginStatus.email}
          </Typography>
          <Typography fontSize="0.95rem" color="text.secondary" mb={0.5}>
            {userLoginStatus.store_code === 1 && "Super Admin"}
          </Typography>
          <Typography fontSize="0.9rem" color="text.secondary" mb={1}>
            Role: {userLoginStatus.role}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Button
            fullWidth
            variant="text"
            color="error"
            onClick={onLogoutClick}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: "bold",
            }}
            startIcon={<span style={{ fontSize: 18 }}>↩</span>}
          >
            Log out
          </Button>
        </Popover>
      </Box>
    </Box>
  );
};

export default HeaderPannel;
