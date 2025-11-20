import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../data/images/melon.png";
import { useEffect, useState } from "react";
import LsService, { storageKey } from "../services/localstorage";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ClassIcon from "@mui/icons-material/Class";
import FactoryIcon from "@mui/icons-material/Factory";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import InventoryTwoToneIcon from "@mui/icons-material/InventoryTwoTone";
import Inventory2TwoToneIcon from "@mui/icons-material/Inventory2TwoTone";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const LeftPannel = ({ HeaderTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActiveRoute = (route) => location.pathname === route;
  const user = LsService.getItem(storageKey);
  const [sections, setSections] = useState([]);

  // Map navItems to icons
  const navIcons = {
    "/super-admin": <DashboardIcon />,
    "/warehouse-admin": <DashboardIcon />,
    "/store-manager": <DashboardIcon />,
    "/categories": <CategoryIcon />,
    "//suppliers": <BusinessIcon />,
    "/units": <ClassIcon />,
    "/stores": <FactoryIcon />,
    "/brands": <AssignmentTurnedInIcon />,
    "/users_management": <GroupIcon />,
    "/products": <ShoppingBasketIcon />,
    "/add-to-main": <AddShoppingCartIcon />,
    "/add-store-products": <AddShoppingCartIcon />,
    "/store-pendings": <ProductionQuantityLimitsIcon />,
    "/store-recived-products": <ShoppingBagIcon />,
    "/inventory-by-store": <Inventory2TwoToneIcon />,
    "/confirm-store-inventory": <InventoryTwoToneIcon />,
    "/add-store-combos": <WorkspacesIcon />,
    "/store-inventory": <ShoppingCartIcon />,
    "/billings": <ReceiptLongIcon />,
    "/store-billings": <ReceiptLongIcon />,
    "/display-combos": <ShoppingCartIcon />,
  };

  // Example sections
  const superAdminSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", route: "/super-admin" },
        // { label: "Billings", route: "/billings" },
        { label: "Manage Users", route: "/users_management" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Brands", route: "/brands" },
        { label: "Main Inventory", route: "/products" },
        { label: "Create Main Products", route: "/add-to-main" },
        // { label: "Add Store Combos", route: "/add-store-combos" },
        // { label: "View Combos", route: "/display-combos" },
      ],
    },
  ];

  useEffect(() => {
    // console.log(user);
    if (user) {
      if (user.role === "admin") {
        setSections(superAdminSections);
      }
    } else {
      return;
    }
  }, []);

  const getSectionForRoute = (pathname) => {
    const found = sections.find((section) =>
      section.items.some((item) => item.route === pathname)
    );
    return found ? found.title : sections[0]?.title ?? "";
  };

  const [openSection, setOpenSection] = useState(
    sections.length > 0 ? sections[0].title : ""
  );

  useEffect(() => {
    setOpenSection(
      getSectionForRoute(location.pathname) || (sections[0]?.title ?? "")
    );
  }, [location.pathname, sections]);

  const onHandleNav = () => {
    if (user.role === "admin") {
      navigate("/super-admin");
    } else {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        width: "15vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent:"start",
        gap: 2,
      }}
    >
      <Box
        sx={{
          height: "10vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
          backgroundColor: "#fafafa",
          borderRadius: "10px",
        }}
        onClick={() => onHandleNav()}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            marginRight: "10px",
            marginLeft: "20px",
          }}
        />
        <Typography variant="subtitle1" fontWeight="bold">
          {HeaderTitle}
        </Typography>
      </Box>

      <Box
        sx={{
          width: "92%",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
          backgroundColor: "#fafafa",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          p: 1,
        }}
      >
        {sections.map((section, idx) => (
          <Box key={section.title} sx={{ width: "100%", mb: 1, }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                // pl: 2,
                mb: 0.5,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() =>
                setOpenSection(
                  openSection === section.title ? "" : section.title
                )
              }
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flexGrow: 1 }}
              >
                {section.title}
              </Typography>
              {openSection === section.title ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </Box>
            {openSection === section.title && (
              <List disablePadding>
                {section.items.map((item) => (
                  <ListItemButton
                    key={item.route}
                    selected={isActiveRoute(item.route)}
                    onClick={() => navigate(item.route)}
                    sx={{
                      borderRadius: 2,
                      my: 0.5,
                      bgcolor: isActiveRoute(item.route)
                        ? "#f4f4f5"
                        : "transparent",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {navIcons[item.route] || <DashboardIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActiveRoute(item.route)
                          ? "bold"
                          : "normal",
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
            {idx < sections.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LeftPannel;
