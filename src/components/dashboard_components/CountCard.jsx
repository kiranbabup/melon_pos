import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CountCard = ({ HeadTitle, IconCompo, Value, Navpath }) => {
  const nav = useNavigate();

  return (
    <Box
      sx={{
        borderRadius: "10px",
        boxShadow:
          "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
        backgroundColor: "#506991",
        width: "16rem",
        height: "12vh",
        p: 2,
        cursor: "pointer",
        // base icon color
        "& .count-card-icon": {
          color: "#f47920",
          transition: "color 0.2s",
        },
        ":hover": {
          backgroundColor: "#0d3679",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
          transform: "scale(1.02)",
          "& .count-card-title": {
            fontWeight: "bold",
          },
          // icon color on card hover 👇
          "& .count-card-icon": {
            color: "#fbbf24",
          },
        },
      }}
      onClick={() => nav(Navpath)}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography className="count-card-title" color="white">
          {HeadTitle}
        </Typography>
        <IconCompo className="count-card-icon" />
      </Box>
      <Typography
        sx={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "white",
        }}
      >
        {Value}
      </Typography>
    </Box>
  );
};

export default CountCard;
